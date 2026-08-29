import mongoose from "mongoose";

const MAX_RETRIES = 3;
const RETRY_INTERVAL = 5000; // 5 seconds

class DatabaseConnection {
  constructor() {
    this.retryCount = 0;
    this.isConnected = false;

    // configure mongoose settings
    mongoose.set("strictQuery", true);

    // handle connection events
    mongoose.connection.on("connected", () => {
      console.log("MongoDB connected successfully.");
      this.isConnected = true;
    });

    mongoose.connection.on("error", (err) => {
      console.log(`MongoDB connection error: ${err}`);
      this.isConnected = false;
    });

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected");
      this.isConnected = false;
      this.handleDisconnection();
    });

    // Handle Application Termination
    process.on("SIGINT", this.handleTermination.bind(this));
    process.on("SIGTERM", this.handleTermination.bind(this));
  }

  async connect() {
    try {
      if (!process.env.MONGO_URL) {
        throw new Error("MONGO_URL is not defined in environment variables.");
      }

      const connectionOptions = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        serverselectionTimeoutMS: 5000, // 5 seconds for server selection
        socketTimeoutMS: 45000, // 45 seconds for socket timeout
        family: 4, // IPv4
      };

      if (process.env.NODE_ENV === "development") {
        mongoose.set("debug", true);
      }

      await mongoose.connect(process.env.MONGO_URL, connectionOptions);
      this.retryCount = 0; // reset retry count on successful connection
    } catch (error) {
      console.log("Failed to connect to MongoDB: ", error.message);
      await this.handleDisconnectionError();
    }
  }

  async handleDisconnectionError() {
    if (this.retryCount < MAX_RETRIES) {
      this.retryCount++;
      console.log(
        `Retrying connection... Attempt ${this.retryCount} of ${MAX_RETRIES}`,
      );
      await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL));
      await this.connect();
    } else {
      console.error(
        `Failed to connect to MongoDB after ${MAX_RRETRIES} attempts.`,
      );
      process.exit(1);
    }
  }

  async handleDisconnection() {
    if (!this.isConnected) {
      console.log(`Attempting to reconnect to mongoDB...`);
      await this.connect();
    }
  }


  async handleTermination() {
    try {
        await mongoose.connection.close();
        console.log("MongoDB connection is closed through app termination.")
        process.exit(0);
    } catch (error) {
        console.error("Error during MongoDB disconnection:", error);
        process.exit(1);
    }
  }

  getConnectionStatus(){
    return {
        isconnected: this.isConnected,
        readyState: mongoose.connection.readyState,
        host: mongoose.connection.host,
        name: mongoose.connection.name
    }
  }
}


const dbConnection = new DatabaseConnection();
export default dbConnection.connect.bind(this);
export const getConnectionStatus = dbConnection.getConnectionStatus.bind(this);