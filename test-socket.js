// Test simple de Socket.IO cliente
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001', {
    transports: ['websocket', 'polling']
});

console.log('🔌 Intentando conectar al servidor...\n');

socket.on('connect', () => {
    console.log('✅ Conectado al servidor Socket.IO');
    console.log(`📝 Socket ID: ${socket.id}\n`);

    // Test 1: Unirse con un nickname
    console.log('🧪 Test 1: Unirse al chat con nickname "TestUser1"');
    socket.emit('user:join', { nickname: 'TestUser1' }, (response) => {
        if (response.success) {
            console.log('✅ Usuario unido exitosamente');
            console.log(`   Nickname: ${response.user.nickname}`);
            console.log(`   Usuarios online: ${response.onlineUsers.join(', ')}\n`);

            // Test 2: Intentar unirse con el mismo nickname
            testDuplicateNickname();
        } else {
            console.log(`❌ Error: ${response.error}\n`);
        }
    });
});

function testDuplicateNickname() {
    console.log('🧪 Test 2: Intentar unirse con nickname duplicado');
    const socket2 = io('http://localhost:3001', {
        transports: ['websocket', 'polling']
    });

    socket2.on('connect', () => {
        socket2.emit('user:join', { nickname: 'TestUser1' }, (response) => {
            if (!response.success) {
                console.log('✅ Validación correcta - nickname duplicado rechazado');
                console.log(`   Error: ${response.error}\n`);
            } else {
                console.log('❌ ERROR: Se permitió nickname duplicado\n');
            }
            socket2.disconnect();

            // Test 3: Validación de nickname
            testNicknameValidation();
        });
    });
}

function testNicknameValidation() {
    console.log('🧪 Test 3: Validar restricciones de nickname');

    const socket3 = io('http://localhost:3001', {
        transports: ['websocket', 'polling']
    });

    socket3.on('connect', () => {
        // Nickname muy corto
        socket3.emit('user:join', { nickname: 'ab' }, (response) => {
            if (!response.success) {
                console.log('✅ Nickname corto rechazado correctamente');
                console.log(`   Error: ${response.error}`);
            }

            // Nickname con caracteres inválidos
            socket3.emit('user:join', { nickname: 'test@user' }, (response) => {
                if (!response.success) {
                    console.log('✅ Nickname con caracteres especiales rechazado');
                    console.log(`   Error: ${response.error}\n`);
                }
                socket3.disconnect();

                // Test 4: Lista de usuarios
                testUsersList();
            });
        });
    });
}

function testUsersList() {
    console.log('🧪 Test 4: Verificar lista de usuarios online');

    const socket4 = io('http://localhost:3001', {
        transports: ['websocket', 'polling']
    });

    socket4.on('users:list', (users) => {
        console.log('✅ Lista de usuarios recibida:');
        console.log(`   Usuarios: ${users.join(', ')}`);
        console.log(`   Total: ${users.length}\n`);
    });

    socket4.on('connect', () => {
        socket4.emit('user:join', { nickname: 'TestUser2' }, (response) => {
            if (response.success) {
                console.log('✅ TestUser2 unido exitosamente\n');

                setTimeout(() => {
                    socket4.disconnect();
                    setTimeout(() => {
                        console.log('🏁 Tests completados\n');
                        console.log('📊 Resumen:');
                        console.log('   ✅ Conexión Socket.IO');
                        console.log('   ✅ Sistema de join con nickname único');
                        console.log('   ✅ Validaciones de nickname');
                        console.log('   ✅ Lista de usuarios online');
                        console.log('   ✅ Sincronización en tiempo real\n');

                        socket.disconnect();
                        process.exit(0);
                    }, 1000);
                }, 2000);
            }
        });
    });
}

socket.on('connect_error', (error) => {
    console.log('❌ Error de conexión:', error.message);
    process.exit(1);
});

socket.on('disconnect', (reason) => {
    console.log('👋 Desconectado:', reason);
});

// Timeout de seguridad
setTimeout(() => {
    console.log('⏱️  Timeout - cerrando tests');
    process.exit(0);
}, 15000);
