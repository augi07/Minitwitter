import express, { Express } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import fs from 'fs'
import path from 'path'

export class auth {
    // Properties
    protected Username: string
    protected Password: string
    constructor(Username: string, Password: string) {
        this.Username = Username
        this.Password = Password
    }

    
}