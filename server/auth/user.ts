import express, { Express } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import fs from 'fs'
import path from 'path'
import { USER_TABLE, TWEET_TABLE } from '../database/schema'


type UserRole ="Admin" | "anchorman" | "user";

class InserUser {
    private Username: string
    private Password: string
    private role: UserRole
    constructor(Username: string, Password: string) {
        this.Username = Username
        this.Password = Password
    }
    
    Inseruser(Username:string, Password:string, Role:UserRole) {
        
    }
}

export { InserUser };