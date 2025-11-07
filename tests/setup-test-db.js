const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupTestDatabase() {
  try {
    console.log('🧹 Limpando banco de dados...');
    
    // Limpar todas as tabelas na ordem correta (respeitando foreign keys)
    await prisma.transaction.deleteMany();
    await prisma.automation.deleteMany();
    await prisma.company.deleteMany();
    await prisma.user.deleteMany();
    
    console.log('✅ Banco de dados limpo');
    
    console.log('📊 Verificando estado do banco...');
    const userCount = await prisma.user.count();
    const companyCount = await prisma.company.count();
    
    console.log(`   Usuários: ${userCount}`);
    console.log(`   Empresas: ${companyCount}`);
    
    if (userCount === 0 && companyCount === 0) {
      console.log('✅ Banco de dados pronto para testes');
    } else {
      console.log('⚠️  Aviso: Ainda existem registros no banco');
    }
    
  } catch (error) {
    console.error('❌ Erro ao preparar banco de dados:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

setupTestDatabase();
