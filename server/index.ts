import dotenv from "dotenv";
import path from "path";

// Load .env file from project root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Validate required environment variables
if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables!');
  console.error('Please make sure .env file exists and contains:');
  console.error('MONGODB_URI=your_mongodb_connection_string_here');
  process.exit(1);
}

// Check Supabase configuration (warn but don't exit)
if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('⚠️ Supabase configuration not found in environment variables!');
  console.warn('   Password change via email will not work.');
  console.warn('   Please make sure .env file contains:');
  console.warn('   VITE_SUPABASE_URL=...');
  console.warn('   VITE_SUPABASE_ANON_KEY=...');
} else {
  console.log('✅ Supabase configuration found');
}

// Check AI API configuration (optional but recommended)
const aiProviders = [
  { name: 'DeepSeek', key: 'DEEPSEEK_API_KEY', url: 'https://platform.deepseek.com/' },
  { name: 'Kimi (Moonshot)', key: 'KIMI_API_KEY', url: 'https://platform.moonshot.cn/' },
  { name: 'OpenAI', key: 'OPENAI_API_KEY', url: 'https://platform.openai.com/' },
  { name: 'Groq', key: 'GROQ_API_KEY', url: 'https://console.groq.com/' },
];

let activeProvider: { name: string; key: string; url: string } | null = null;
for (const provider of aiProviders) {
  if (process.env[provider.key]) {
    activeProvider = provider;
    const apiKeyPreview = process.env[provider.key]!.substring(0, 10) + '...';
    console.log(`✅ ${provider.name} API key found:`, apiKeyPreview);
    console.log(`   AI chat will use ${provider.name} API for intelligent responses`);
    break;
  }
}

if (!activeProvider) {
  console.warn('⚠️ No AI API key found in environment variables!');
  console.warn('   AI chat will use rule-based engine (limited responses)');
  console.warn('   To enable full AI capabilities, add ONE of the following to .env:');
  console.warn('   • DEEPSEEK_API_KEY=your_key (https://platform.deepseek.com/)');
  console.warn('   • KIMI_API_KEY=your_key (https://platform.moonshot.cn/) - Free tier available');
  console.warn('   • OPENAI_API_KEY=your_key (https://platform.openai.com/)');
  console.warn('   • GROQ_API_KEY=your_key (https://console.groq.com/) - Free tier available');
}

console.log('✅ Environment configuration validated');

import express, { type Request, Response, NextFunction } from "express";
import { connectDB } from "./mongodb";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { createAdminAccount } from "./admin-setup";
import { initDemoCoupons } from "./init-demo-coupons";

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process, just log the error
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Don't exit the process, just log the error
});

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Connect to MongoDB
  await connectDB();
  
  // Create admin account on server start
  await createAdminAccount();
  
  // Initialize demo coupons
  await initDemoCoupons();
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Unhandled error in Express error handler:", err);
    console.error("Error stack:", err.stack);
    
    // Don't re-throw the error - it crashes the server
    // Just send the error response
    if (!res.headersSent) {
      res.status(status).json({ message });
    }
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();
