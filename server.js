import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import { randomUUID } from 'crypto';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { PrismaClient } = require('@prisma/client');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();

// Helper to get full state from DB for broadcast
async function getFullState() {
    const senhas = await prisma.senha.findMany();
    const senhaAtual = await prisma.senha.findFirst({
        where: { status: { in: ['chamada', 'atendendo'] } },
        orderBy: { horaChamada: 'desc' }
    });

    // Ultimas senhas (chamadas ou concluidas recentemente)
    const ultimasSenhas = await prisma.senha.findMany({
        where: { horaChamada: { not: null } },
        orderBy: { horaChamada: 'desc' },
        take: 5
    });

    const configNormal = await prisma.config.findUnique({ where: { key: 'contadorNormal' } });
    const configPrioritaria = await prisma.config.findUnique({ where: { key: 'contadorPrioritaria' } });

    return {
        senhas,
        senhaAtual,
        ultimasSenhas,
        contadorNormal: configNormal ? configNormal.value : 1,
        contadorPrioritaria: configPrioritaria ? configPrioritaria.value : 1
    };
}

async function startServer() {
    // Inicializar contadores se não existirem
    try {
        const cN = await prisma.config.findUnique({ where: { key: 'contadorNormal' } });
        if (!cN) await prisma.config.create({ data: { key: 'contadorNormal', value: 1 } });

        const cP = await prisma.config.findUnique({ where: { key: 'contadorPrioritaria' } });
        if (!cP) await prisma.config.create({ data: { key: 'contadorPrioritaria', value: 1 } });

        // Inicializar usuários de exemplo se vazio
        const userCount = await prisma.usuario.count();
        if (userCount === 0) {
            await prisma.usuario.createMany({
                data: [
                    { nome: 'Maria Silva', email: 'maria@prefeitura.gov', funcao: 'Atendente', guiche: 1, tiposAtendimento: JSON.stringify(['Benefícios', 'Atualização']) },
                    { nome: 'João Santos', email: 'joao@prefeitura.gov', funcao: 'Atendente', guiche: 2, tiposAtendimento: JSON.stringify(['Cadastro Novo', 'Informações', 'Documentação']) },
                    { nome: 'Ana Costa', email: 'ana@prefeitura.gov', funcao: 'Gerador' }
                ]
            });
        }
    } catch (e) {
        console.error("Erro na inicialização do DB:", e);
    }

    const app = express();
    const httpServer = createServer(app);
    const io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
    });

    app.use(vite.middlewares);

    io.on('connection', async (socket) => {
        console.log('Cliente conectado:', socket.id);

        try {
            // 1. Send Initial State
            const initialState = await getFullState();
            socket.emit('stateUpdated', initialState);
        } catch (e) {
            console.error("Erro ao enviar estado inicial:", e);
        }

        // 2. Handle 'request_ticket'
        socket.on('request_ticket', async (data) => {
            console.log('Recebido request_ticket 2:', data);
            try {
                const { nome, tipo, prioridade } = data;

                const configKey = prioridade === 'prioritaria' ? 'contadorPrioritaria' : 'contadorNormal';
                const prefixo = prioridade === 'prioritaria' ? 'P' : 'N';

                const config = await prisma.config.findUnique({ where: { key: configKey } });
                const contador = config ? config.value : 1;
                const numero = `${prefixo}${String(contador).padStart(3, '0')}`;

                await prisma.config.update({
                    where: { key: configKey },
                    data: { value: contador + 1 }
                });

                await prisma.senha.create({
                    data: {
                        numero,
                        nome,
                        tipo,
                        prioridade,
                        status: 'aguardando',
                        horaGeracao: new Date()
                    }
                });

                const newState = await getFullState();
                io.emit('stateUpdated', newState);
                console.log('Senha criada com sucesso.');
            } catch (err) {
                console.error('Erro em request_ticket:', err);
            }
        });

        // 3. Handle 'call_ticket'
        socket.on('call_ticket', async (data) => {
            try {
                const { guiche, atendente, tiposPermitidos } = data;

                // Busca fila no DB
                const todasSenhas = await prisma.senha.findMany({
                    where: { status: 'aguardando' }
                });

                const fila = todasSenhas
                    .filter(s => {
                        if (tiposPermitidos && tiposPermitidos.length > 0) {
                            return tiposPermitidos.includes(s.tipo);
                        }
                        return true;
                    })
                    .sort((a, b) => {
                        if (a.prioridade === b.prioridade) {
                            return new Date(a.horaGeracao).getTime() - new Date(b.horaGeracao).getTime();
                        }
                        return a.prioridade === 'prioritaria' ? -1 : 1;
                    });

                if (fila.length === 0) return;

                const proximaSenha = fila[0];

                // Atualiza status no DB
                await prisma.senha.update({
                    where: { id: proximaSenha.id },
                    data: {
                        status: 'chamada',
                        guiche,
                        atendente,
                        horaChamada: new Date()
                    }
                });

                const newState = await getFullState();
                io.emit('stateUpdated', newState);

                // Timeout para 'atendendo'
                setTimeout(async () => {
                    // Verifica se ainda está 'chamada' antes de mudar
                    const check = await prisma.senha.findUnique({ where: { id: proximaSenha.id } });
                    if (check && check.status === 'chamada') {
                        await prisma.senha.update({
                            where: { id: proximaSenha.id },
                            data: { status: 'atendendo' }
                        });
                        const updatedState = await getFullState();
                        io.emit('stateUpdated', updatedState);
                    }
                }, 2000);
            } catch (e) {
                console.error("Erro em call_ticket:", e);
            }
        });

        // 4. Handle 'update_ticket_status'
        socket.on('update_ticket_status', async (data) => {
            try {
                const { id, status } = data;
                await prisma.senha.update({
                    where: { id },
                    data: {
                        status,
                        horaFinalizacao: new Date()
                    }
                });
                const newState = await getFullState();
                io.emit('stateUpdated', newState);
            } catch (e) {
                console.error("Erro update_ticket_status:", e);
            }
        });

        // 5. Handle 'repeat_ticket'
        socket.on('repeat_ticket', async () => {
            try {
                const current = await prisma.senha.findFirst({
                    where: { status: { in: ['chamada', 'atendendo'] } },
                    orderBy: { horaChamada: 'desc' }
                });

                if (current) {
                    await prisma.senha.update({
                        where: { id: current.id },
                        data: { horaChamada: new Date() }
                    });
                    const newState = await getFullState();
                    io.emit('stateUpdated', newState);
                }
            } catch (e) { console.error("Erro repeat_ticket:", e); }
        });

        // --- ADMIN EVENTS ---

        // 6. Reset Queue (Zerar Fila)
        socket.on('admin_reset_queue', async (callback) => {
            console.log('Admin: Resetting queue...');
            try {
                // Delete all tickets
                await prisma.senha.deleteMany({});

                // Reset counters
                await prisma.config.update({ where: { key: 'contadorNormal' }, data: { value: 1 } });
                await prisma.config.update({ where: { key: 'contadorPrioritaria' }, data: { value: 1 } });

                const newState = await getFullState();
                io.emit('stateUpdated', newState);

                if (callback) callback({ success: true });
            } catch (e) {
                console.error("Erro reset_queue:", e);
                if (callback) callback({ success: false, error: e.message });
            }
        });

        // 7. Get Users
        socket.on('admin_get_users', async (callback) => {
            try {
                const users = await prisma.usuario.findMany();
                if (callback) callback({ success: true, data: users });
            } catch (e) {
                if (callback) callback({ success: false, error: e.message });
            }
        });

        // 8. Create User
        socket.on('admin_create_user', async (data, callback) => {
            try {
                const { nome, email, funcao, guiche, tiposAtendimento } = data;
                await prisma.usuario.create({
                    data: {
                        nome,
                        email,
                        funcao,
                        guiche: parseInt(guiche) || null,
                        tiposAtendimento: JSON.stringify(tiposAtendimento || [])
                    }
                });

                // Broadcast updated user list
                const users = await prisma.usuario.findMany();
                io.emit('usersUpdated', users);

                if (callback) callback({ success: true });
            } catch (e) {
                console.error("Erro create_user:", e);
                if (callback) callback({ success: false, error: e.message });
            }
        });

        // 9. Delete User
        socket.on('admin_delete_user', async (id, callback) => {
            try {
                await prisma.usuario.delete({ where: { id } });

                // Broadcast updated user list
                const users = await prisma.usuario.findMany();
                io.emit('usersUpdated', users);

                if (callback) callback({ success: true });
            } catch (e) {
                console.error("Erro delete_user:", e);
                if (callback) callback({ success: false, error: e.message });
            }
        });

        socket.on('disconnect', () => { });
    });

    const PORT = 3000;
    httpServer.listen(PORT, '0.0.0.0', () => {
        console.log(`Servidor rodando em http://localhost:${PORT}`);
    });
}

startServer();
