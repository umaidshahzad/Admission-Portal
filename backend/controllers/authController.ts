import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.ts';
import { AuthRequest } from '../middleware/authMiddleware.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'JWT123';

/**
 * Register a new Applicant
 */
export async function register(req: AuthRequest, res: Response) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Verify if user already exists
    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Force role to 'applicant'
    const newUser = await User.create({
      name: name.trim(),
      email: trimmedEmail,
      password: hashedPassword,
      role: 'applicant'
    });

    // Create JWT Token
    const token = jwt.sign(
      { id: newUser._id.toString(), email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}

/**
 * User Login
 */
export async function login(req: AuthRequest, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const trimmedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: trimmedEmail });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password || '');
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id.toString(), email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}

/**
 * Get current authenticated user details
 */
export async function getMe(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.json({ user });
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal server error.' });
  }
}

/**
 * Read: Get all users (Admin only)
 */
export async function getUsers(req: AuthRequest, res: Response) {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    return res.json({ users });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to retrieve users.' });
  }
}

/**
 * Create: Admin manually adds a staff member or user
 */
export async function createUser(req: AuthRequest, res: Response) {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Name, email, password, and role are required.' });
    }

    const trimmedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name: name.trim(),
      email: trimmedEmail,
      password: hashedPassword,
      role
    });

    return res.status(201).json({
      message: 'User created successfully.',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt
      }
    });
  } catch (error: any) {
    console.error('Admin create user error:', error);
    return res.status(500).json({ message: 'Failed to create user.' });
  }
}

/**
 * Update: Admin edits a user account
 */
export async function updateUser(req: AuthRequest, res: Response) {
  try {
    const { name, email, role, password } = req.body;
    const userId = req.params.id;

    console.log(`[AUTH CONTROLLER] Admin attempting to update user. ID: ${userId}, email: ${email}`);

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (email) {
      const trimmedEmail = email.trim().toLowerCase();
      if (trimmedEmail !== user.email) {
        const emailExists = await User.findOne({ email: trimmedEmail });
        if (emailExists) {
          return res.status(400).json({ message: 'Email already taken.' });
        }
        user.email = trimmedEmail;
      }
    }

    if (name) user.name = name.trim();
    if (role) user.role = role;

    if (password && password.trim() !== '') {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();
    console.log(`[AUTH CONTROLLER] User updated successfully: ${user.email}`);

    return res.json({
      message: 'User updated successfully.',
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error: any) {
    console.error('[AUTH CONTROLLER] Admin update user error:', error);
    return res.status(500).json({ message: error.message || 'Failed to update user.' });
  }
}

/**
 * Delete: Admin deletes a user account
 */
export async function deleteUser(req: AuthRequest, res: Response) {
  try {
    const userId = req.params.id;
    console.log(`[AUTH CONTROLLER] Admin attempting to delete user. Target ID: ${userId}, Current Admin ID: ${req.user?.id}`);

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required.' });
    }

    // Prevent deleting oneself using safe string comparison
    if (userId.toString() === req.user?.id?.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own admin account.' });
    }

    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    console.log(`[AUTH CONTROLLER] User deleted successfully: ${deletedUser.email}`);
    return res.json({ message: 'User deleted successfully.' });
  } catch (error: any) {
    console.error('[AUTH CONTROLLER] Admin delete user error:', error);
    return res.status(500).json({ message: error.message || 'Failed to delete user.' });
  }
}
