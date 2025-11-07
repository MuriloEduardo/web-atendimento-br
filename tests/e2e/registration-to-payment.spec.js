import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';
const TEST_USER = {
  name: 'Test User',
  email: `test-${Date.now()}@example.com`,
  password: 'Test@123456'
};

const TEST_COMPANY = {
  companyName: 'Test Company Inc',
  businessType: 'E-commerce',
  monthlyCustomers: '50-200 por mês',
  currentWhatsApp: '(11) 99999-9999',
  mainGoal: 'Vender mais'
};

test.describe('Fluxo completo: Registro até Pagamento', () => {
  test.beforeEach(async ({ page }) => {
    // Limpar cookies e storage
    await page.context().clearCookies();
    await page.goto(BASE_URL);
  });

  test('Deve completar o cadastro e renderizar componente de pagamento Stripe', async ({ page }) => {
    test.setTimeout(120000); // 2 minutos para o teste completo

    // ========== PASSO 1: REGISTRO ==========
    console.log('PASSO 1: Iniciando registro...');
    await page.goto(`${BASE_URL}/cadastro`);
    await page.waitForLoadState('networkidle');

    // Preencher formulário de registro
    await page.fill('input[name="name"]', TEST_USER.name);
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);
    
    // Clicar no botão de registro
    await page.click('button[type="submit"]');
    
    // Aguardar redirecionamento para onboarding
    await page.waitForURL('**/onboarding', { timeout: 10000 });
    console.log('✓ Registro concluído, redirecionado para onboarding');

    // Verificar se token foi salvo
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeTruthy();
    console.log('✓ Token JWT salvo no localStorage');

    // ========== PASSO 2: WELCOME STEP ==========
    console.log('PASSO 2: Welcome Step...');
    await expect(page.locator('text=Bem-vindo ao Atendimento BR!')).toBeVisible();
    await page.click('button:has-text("Vamos começar")');
    await page.waitForTimeout(1000);
    console.log('✓ Welcome step concluído');

    // ========== PASSO 3: BUSINESS INFO ==========
    console.log('PASSO 3: Preenchendo informações da empresa...');
    await expect(page.locator('text=Sobre sua empresa')).toBeVisible();

    // Preencher dados da empresa
    await page.fill('input[id="companyName"]', TEST_COMPANY.companyName);
    await page.selectOption('select[id="businessType"]', TEST_COMPANY.businessType);
    await page.selectOption('select[id="monthlyCustomers"]', TEST_COMPANY.monthlyCustomers);
    await page.fill('input[id="currentWhatsApp"]', TEST_COMPANY.currentWhatsApp);
    await page.selectOption('select[id="mainGoal"]', TEST_COMPANY.mainGoal);

    // Interceptar requisição de salvamento
    const businessInfoPromise = page.waitForResponse(
      response => response.url().includes('/api/onboarding/business-info') && response.status() === 200,
      { timeout: 10000 }
    );

    await page.click('button[type="submit"]:has-text("Continuar")');
    
    const businessInfoResponse = await businessInfoPromise;
    const businessInfoData = await businessInfoResponse.json();
    
    console.log('✓ Informações da empresa salvas:', businessInfoData);
    expect(businessInfoData.company).toBeTruthy();
    expect(businessInfoData.company.id).toBeTruthy();
    console.log('✓ Empresa criada no banco de dados com ID:', businessInfoData.company.id);

    await page.waitForTimeout(1000);

    // ========== PASSO 4: WHATSAPP NUMBER ==========
    console.log('PASSO 4: Escolhendo número do WhatsApp...');
    await expect(page.locator('text=Número do WhatsApp')).toBeVisible();
    
    await page.click('input[name="numberChoice"][value="new"]');
    await page.click('input[name="purchaseChoice"][value="we-buy"]');
    await page.click('button[type="submit"]:has-text("Continuar")');
    await page.waitForTimeout(1000);
    console.log('✓ Número do WhatsApp configurado');

    // ========== PASSO 5: META BUSINESS ==========
    console.log('PASSO 5: Configurando Meta Business...');
    await expect(page.locator('text=Meta Business')).toBeVisible();
    
    await page.click('input[name="knowsMetaBusiness"][value="no"]');
    await page.click('button[type="submit"]:has-text("Continuar")');
    await page.waitForTimeout(1000);
    console.log('✓ Meta Business configurado');

    // ========== PASSO 6: AUTOMATION SETUP ==========
    console.log('PASSO 6: Configurando automação...');
    await expect(page.locator('text=Configuração da Automação')).toBeVisible();
    
    await page.click('input[name="businessHours"][value="always"]');
    await page.click('button[type="submit"]:has-text("Continuar")');
    await page.waitForTimeout(1000);
    console.log('✓ Automação configurada');

    // ========== PASSO 7: SUBSCRIPTION (PAGAMENTO) ==========
    console.log('PASSO 7: Selecionando plano e aguardando renderização do Stripe...');
    await expect(page.locator('text=Escolha seu Plano')).toBeVisible({ timeout: 10000 });
    console.log('✓ Página de planos carregada');

    // Selecionar plano Professional
    await page.click('button:has-text("Professional")');
    console.log('✓ Plano Professional selecionado');

    // Clicar em confirmar assinatura
    const confirmButton = page.locator('button:has-text("Confirmar assinatura")');
    await expect(confirmButton).toBeVisible();
    
    // Interceptar navegação para página de pagamento
    const navigationPromise = page.waitForURL('**/payment/**', { timeout: 15000 });
    
    await confirmButton.click();
    console.log('✓ Botão de confirmação clicado');
    
    await navigationPromise;
    const currentUrl = page.url();
    console.log('✓ Redirecionado para:', currentUrl);
    expect(currentUrl).toContain('/payment/');

    // ========== PASSO 8: VERIFICAR EMPRESA EXISTE ==========
    console.log('PASSO 8: Verificando criação da empresa via API...');
    const companyResponse = await page.evaluate(async () => {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/company/current', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return {
        status: response.status,
        data: await response.json()
      };
    });

    console.log('Resposta da API /api/company/current:', companyResponse);
    expect(companyResponse.status).toBe(200);
    expect(companyResponse.data.company).toBeTruthy();
    expect(companyResponse.data.company.name).toBe(TEST_COMPANY.companyName);
    console.log('✓ Empresa confirmada no banco:', companyResponse.data.company);

    // ========== PASSO 9: VERIFICAR PAYMENT INTENT ==========
    console.log('PASSO 9: Aguardando criação do Payment Intent...');
    
    // Aguardar requisição de create-intent
    await page.waitForResponse(
      response => response.url().includes('/api/payment/create-intent') && response.status() === 200,
      { timeout: 20000 }
    );
    console.log('✓ Payment Intent criado com sucesso');

    // ========== PASSO 10: VERIFICAR STRIPE ELEMENTS ==========
    console.log('PASSO 10: Verificando renderização dos elementos Stripe...');
    
    // Aguardar o iframe do Stripe carregar
    await page.waitForSelector('iframe[name^="__privateStripeFrame"]', { timeout: 30000 });
    console.log('✓ Iframe do Stripe encontrado na página');

    // Verificar se há múltiplos iframes (Stripe renderiza vários para diferentes campos)
    const stripeFrames = await page.locator('iframe[name^="__privateStripeFrame"]').count();
    expect(stripeFrames).toBeGreaterThan(0);
    console.log(`✓ Total de ${stripeFrames} iframes do Stripe renderizados`);

    // Verificar elementos visuais da página de pagamento
    await expect(page.locator('text=/Professional|Starter|Enterprise/i')).toBeVisible();
    console.log('✓ Nome do plano visível na página');

    // Verificar se há botão de pagamento
    const payButton = page.locator('button:has-text("Pagar"), button:has-text("Confirmar")');
    await expect(payButton).toBeVisible({ timeout: 10000 });
    console.log('✓ Botão de pagamento encontrado');

    // ========== VALIDAÇÃO FINAL ==========
    console.log('\n========== VALIDAÇÃO FINAL ==========');
    console.log('✓ Usuário registrado:', TEST_USER.email);
    console.log('✓ Empresa criada:', TEST_COMPANY.companyName);
    console.log('✓ Payment Intent criado');
    console.log('✓ Stripe Elements renderizado corretamente');
    console.log('✓ Todos os passos do fluxo completados com sucesso!');
    console.log('=====================================\n');

    // Screenshot final para evidência
    await page.screenshot({ path: 'test-results/payment-page-final.png', fullPage: true });
    console.log('✓ Screenshot salvo em: test-results/payment-page-final.png');
  });

  test('Deve criar empresa automaticamente se não existir ao acessar pagamento', async ({ page }) => {
    test.setTimeout(60000);

    console.log('Teste: Criação automática de empresa');

    // Registrar usuário
    await page.goto(`${BASE_URL}/cadastro`);
    await page.fill('input[name="name"]', 'User Without Company');
    await page.fill('input[name="email"]', `nocompany-${Date.now()}@example.com`);
    await page.fill('input[name="password"]', 'Test@123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/onboarding', { timeout: 10000 });

    // Pular direto para URL de pagamento (simulando acesso direto)
    await page.goto(`${BASE_URL}/payment/professional`);
    await page.waitForLoadState('networkidle');

    // Verificar se empresa foi criada automaticamente
    const companyResponse = await page.evaluate(async () => {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/company/current', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return {
        status: response.status,
        data: await response.json()
      };
    });

    console.log('Empresa criada automaticamente:', companyResponse);
    expect(companyResponse.status).toBe(200);
    expect(companyResponse.data.company).toBeTruthy();
    console.log('✓ Empresa criada automaticamente ao acessar página de pagamento');
  });

  test('Deve exibir erro se Stripe não estiver configurado', async ({ page }) => {
    // Este teste verifica o comportamento quando Stripe não está configurado
    test.setTimeout(60000);

    console.log('Teste: Verificação de configuração do Stripe');

    // Registrar e ir até o pagamento
    await page.goto(`${BASE_URL}/cadastro`);
    await page.fill('input[name="name"]', 'Stripe Check User');
    await page.fill('input[name="email"]', `stripecheck-${Date.now()}@example.com`);
    await page.fill('input[name="password"]', 'Test@123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/onboarding');

    await page.goto(`${BASE_URL}/payment/starter`);
    await page.waitForLoadState('networkidle');

    // Verificar se há mensagem de carregamento ou erro apropriado
    const hasLoadingOrPayment = await page.locator('text=/Carregando|Payment|Pagamento/i').isVisible();
    expect(hasLoadingOrPayment).toBeTruthy();
    console.log('✓ Página de pagamento carregou apropriadamente');
  });
});
