import express from 'express';
import { addNewUser, checkLoginStatus, loginUser, updateUser } from '../controllers/user.controller.js';

export const router = express.Router();

router.post('/signup',addNewUser)
router.post('/login',loginUser)

router.patch('/', updateUser)

router.get('/', checkLoginStatus)