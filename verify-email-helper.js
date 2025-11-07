#!/usr/bin/env node

/**
 * Test Helper: Verify Email Directly
 * This script bypasses email verification for testing purposes
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyUserEmail(email) {
  try {
    const user = await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: { 
        isEmailVerified: true,
        emailVerificationToken: null
      },
    });
    
    console.log(`✅ Email verified for: ${user.email}`);
    return user;
  } catch (error) {
    console.error('❌ Error verifying email:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.error('Usage: node verify-email-helper.js <email>');
  process.exit(1);
}

verifyUserEmail(email)
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
