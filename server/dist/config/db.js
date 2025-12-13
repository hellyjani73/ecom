"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// src/config/db.ts or connectToMongo.js (wherever you have your DB connection logic)
require('dotenv').config(); // This loads environment variables from .env file
const mongoose = require('mongoose');
const DATABASE = process.env.DATABASE;
const connectToMongo = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose.connect(DATABASE);
        console.log('MongoDB connected successfully');
    }
    catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1); // Exit the process if DB connection fails
    }
});
module.exports = connectToMongo;
