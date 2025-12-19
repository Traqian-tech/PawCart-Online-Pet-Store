import mongoose from 'mongoose';

// MongoDB connection with retry logic
const connectDB = async (retries = 3, delay = 5000) => {
  const mongoURI = process.env.MONGODB_URI || process.env.DATABASE_URL;
  
  if (!mongoURI) {
    console.error('❌ MONGODB_URI or DATABASE_URL must be set in environment variables');
    process.exit(1);
  }

  // Mask sensitive parts of URI for logging
  const maskedURI = mongoURI.replace(/(:\/\/[^:]+:)([^@]+)(@)/, '$1****$3');

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🔄 Attempting MongoDB connection (${attempt}/${retries})...`);
      console.log(`   URI: ${maskedURI}`);

      // Connect to MongoDB with proper options
      await mongoose.connect(mongoURI, {
        dbName: 'petshop', // Explicitly set database name
        serverSelectionTimeoutMS: 10000, // Timeout after 10 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      });
      
      console.log('✅ MongoDB connected successfully');
      return;
    } catch (error: any) {
      const isLastAttempt = attempt === retries;
      
      console.error(`\n❌ MongoDB connection attempt ${attempt} failed:`);
      
      // Provide specific error guidance
      if (error.name === 'MongooseServerSelectionError') {
        console.error('   Error Type: Server Selection Error');
        console.error('   This usually means:');
        console.error('   1. Your IP address is not whitelisted in MongoDB Atlas');
        console.error('   2. Network connectivity issues');
        console.error('   3. MongoDB Atlas cluster is unreachable');
        console.error('\n   💡 To fix IP whitelisting:');
        console.error('      - Go to MongoDB Atlas → Network Access');
        console.error('      - Add your current IP address (or 0.0.0.0/0 for all IPs - less secure)');
        console.error('      - Wait 1-2 minutes for changes to propagate');
      } else if (error.name === 'MongoNetworkError') {
        console.error('   Error Type: Network Error');
        console.error('   Check your internet connection and MongoDB Atlas cluster status');
      } else if (error.message?.includes('authentication')) {
        console.error('   Error Type: Authentication Error');
        console.error('   Check your MongoDB username and password in the connection string');
      } else {
        console.error(`   Error Type: ${error.name || 'Unknown'}`);
        console.error(`   Message: ${error.message || 'No error message'}`);
      }

      if (!isLastAttempt) {
        console.error(`\n⏳ Retrying in ${delay / 1000} seconds...\n`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error('\n❌ All connection attempts failed. Exiting...\n');
        console.error('Full error details:', error);
        process.exit(1);
      }
    }
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed');
  process.exit(0);
});

export { connectDB };