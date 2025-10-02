// Test de reconexión - Simula un usuario que se desconecta y vuelve a conectar
import { io } from 'socket.io-client';

console.log('🧪 Test de Reconexión de Usuario\n');

const nickname = 'TestReconnectUser';
let socket1;

// Paso 1: Conectar primera vez
console.log('📌 Paso 1: Conectando por primera vez...');
socket1 = io('http://localhost:3001', {
    transports: ['websocket', 'polling']
});

socket1.on('connect', () => {
    console.log(`✅ Conectado (Socket ID: ${socket1.id})`);
    
    // Unirse al chat
    socket1.emit('user:join', { nickname }, (response) => {
        if (response.success) {
            console.log(`✅ Primera conexión exitosa como "${nickname}"`);
            console.log(`   Usuarios online: ${response.onlineUsers.join(', ')}\n`);
            
            // Paso 2: Desconectarse
            setTimeout(() => {
                console.log('📌 Paso 2: Desconectando...');
                socket1.disconnect();
                console.log('✅ Desconectado\n');
                
                // Paso 3: Reconectar con el mismo nickname
                setTimeout(() => {
                    console.log('📌 Paso 3: Intentando reconectar con el mismo nickname...');
                    const socket2 = io('http://localhost:3001', {
                        transports: ['websocket', 'polling']
                    });
                    
                    socket2.on('connect', () => {
                        console.log(`✅ Conectado nuevamente (Socket ID: ${socket2.id})`);
                        
                        socket2.emit('user:join', { nickname }, (response) => {
                            if (response.success) {
                                console.log(`✅ ¡RECONEXIÓN EXITOSA! "${nickname}" pudo volver a conectarse`);
                                console.log(`   Usuarios online: ${response.onlineUsers.join(', ')}`);
                                console.log('\n🎉 TEST PASADO: El usuario puede reconectarse con el mismo nickname\n');
                            } else {
                                console.log(`❌ ERROR: ${response.error}`);
                                console.log('❌ TEST FALLIDO: El usuario NO pudo reconectarse\n');
                            }
                            
                            socket2.disconnect();
                            process.exit(response.success ? 0 : 1);
                        });
                    });
                    
                    socket2.on('connect_error', (error) => {
                        console.log('❌ Error de conexión:', error.message);
                        process.exit(1);
                    });
                }, 2000);
            }, 2000);
        } else {
            console.log(`❌ Error en primera conexión: ${response.error}`);
            process.exit(1);
        }
    });
});

socket1.on('connect_error', (error) => {
    console.log('❌ Error de conexión:', error.message);
    process.exit(1);
});

// Timeout de seguridad
setTimeout(() => {
    console.log('⏱️  Timeout - Test incompleto');
    process.exit(1);
}, 15000);
