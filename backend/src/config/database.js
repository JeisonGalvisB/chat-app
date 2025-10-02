import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        };

        const conn = await mongoose.connect(process.env.MONGODB_URI, options);

        console.log(`📦 MongoDB conectado: ${conn.connection.host}`);
        console.log(`📊 Base de datos: ${conn.connection.name}`);

    } catch (error) {
        console.error(`❌ Error de conexión a MongoDB: ${error.message}`);
        process.exit(1);
    }
};

// Manejo de eventos de conexión
mongoose.connection.on('disconnected', () => {
    console.log('⚠️  MongoDB desconectado');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ Error de MongoDB:', err);
});

export default connectDB;