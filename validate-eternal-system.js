#!/usr/bin/env node

/**
 * 🔥 SCRIPT DE VALIDAÇÃO COMPLETA - ETERNAL TRACKING SYSTEM
 * Executa todos os testes críticos e gera relatório detalhado
 */

const fs = require('fs');
const path = require('path');

class EternalSystemValidator {
    constructor() {
        this.results = {
            passed: [],
            failed: [],
            warnings: [],
            metrics: {}
        };
        this.startTime = Date.now();
    }

    // 1. VALIDAR ESTRUTURA DE ARQUIVOS
    async validateFileStructure() {
        console.log('\n🔍 Validando estrutura de arquivos...');

        const criticalFiles = [
            'src/utils/eternal-tracking.js',
            'src/utils/crypto-utils.js',
            'public/sw-eternal.js',
            'src/components/MonitoringDashboard.jsx',
            'src/firebase.js',
            'src/App.jsx'
        ];

        for (const file of criticalFiles) {
            const fullPath = path.join(process.cwd(), file);
            if (fs.existsSync(fullPath)) {
                const stats = fs.statSync(fullPath);
                const sizeKB = (stats.size / 1024).toFixed(2);

                this.results.passed.push(`✅ ${file} (${sizeKB}KB)`);

                // Verificar arquivo eternal-tracking.js tem 1400+ linhas
                if (file.includes('eternal-tracking.js')) {
                    const content = fs.readFileSync(fullPath, 'utf-8');
                    const lines = content.split('\n').length;
                    if (lines > 1400) {
                        this.results.passed.push(`✅ Eternal Tracking: ${lines} linhas de código`);
                        this.results.metrics.eternalTrackingLines = lines;
                    } else {
                        this.results.failed.push(`❌ Eternal Tracking: apenas ${lines} linhas (esperado 1400+)`);
                    }
                }
            } else {
                this.results.failed.push(`❌ Arquivo não encontrado: ${file}`);
            }
        }
    }

    // 2. VALIDAR CONFIGURAÇÕES DE PERSISTÊNCIA
    async validatePersistenceConfig() {
        console.log('\n🔐 Validando configurações de persistência...');

        const trackingPath = path.join(process.cwd(), 'src/utils/eternal-tracking.js');
        const content = fs.readFileSync(trackingPath, 'utf-8');

        // Verificar cookies configurados
        const cookieMatches = content.match(/{ name: '[\w_]+', days: \d+ }/g) || [];
        const cookieCount = cookieMatches.length;

        if (cookieCount >= 8) {
            this.results.passed.push(`✅ ${cookieCount} cookies configurados com diferentes durações`);
            this.results.metrics.totalCookies = cookieCount;

            // Verificar durações
            const durations = cookieMatches.map(m => {
                const days = m.match(/days: (\d+)/)?.[1];
                return parseInt(days);
            }).sort((a, b) => a - b);

            if (durations[durations.length - 1] >= 365) {
                this.results.passed.push(`✅ Cookies com duração até ${durations[durations.length - 1]} dias`);
            }
        } else {
            this.results.failed.push(`❌ Apenas ${cookieCount} cookies (mínimo 8 requerido)`);
        }

        // Verificar storage keys
        const storageKeys = content.match(/storageKeys: \[(.*?)\]/s)?.[1];
        if (storageKeys) {
            const keys = storageKeys.match(/'[\w_]+'/g) || [];
            this.results.passed.push(`✅ ${keys.length} chaves de storage configuradas`);
            this.results.metrics.storageKeys = keys.length;
        }
    }

    // 3. VALIDAR FINGERPRINTING
    async validateFingerprinting() {
        console.log('\n🔍 Validando sistema de fingerprinting...');

        const trackingPath = path.join(process.cwd(), 'src/utils/eternal-tracking.js');
        const content = fs.readFileSync(trackingPath, 'utf-8');

        const fingerprintMethods = [
            'generateCanvasFingerprint',
            'generateWebGLFingerprint',
            'generateAudioFingerprint',
            'generateFontFingerprint',
            'generatePluginFingerprint'
        ];

        let foundMethods = 0;
        for (const method of fingerprintMethods) {
            if (content.includes(method)) {
                this.results.passed.push(`✅ ${method} implementado`);
                foundMethods++;
            }
        }

        if (foundMethods >= 3) {
            this.results.metrics.fingerprintMethods = foundMethods;
        } else {
            this.results.warnings.push(`⚠️ Apenas ${foundMethods} métodos de fingerprinting encontrados`);
        }
    }

    // 4. VALIDAR SERVICE WORKER
    async validateServiceWorker() {
        console.log('\n⚙️ Validando Service Worker...');

        const swPath = path.join(process.cwd(), 'public/sw-eternal.js');
        const content = fs.readFileSync(swPath, 'utf-8');

        // Verificar eventos essenciais
        const events = ['install', 'activate', 'fetch', 'sync', 'message'];
        for (const event of events) {
            if (content.includes(`addEventListener('${event}'`)) {
                this.results.passed.push(`✅ Event listener '${event}' configurado`);
            } else if (event === 'sync') {
                // Sync é opcional mas recomendado
                this.results.warnings.push(`⚠️ Event '${event}' não encontrado (recomendado para offline sync)`);
            }
        }

        // Verificar cache
        if (content.includes('caches.open') && content.includes('cache.addAll')) {
            this.results.passed.push('✅ Cache API implementado');
        }

        // Verificar tracking de afiliados
        if (content.includes('amazon.com') && content.includes('mercadolivre.com')) {
            this.results.passed.push('✅ Tracking de afiliados no SW');
        }
    }

    // 5. VALIDAR AMAZON SUBSCRIBE & SAVE
    async validateAmazonIntegration() {
        console.log('\n🛒 Validando Amazon Subscribe & Save...');

        const trackingPath = path.join(process.cwd(), 'src/utils/eternal-tracking.js');
        const content = fs.readFileSync(trackingPath, 'utf-8');

        if (content.includes('class AmazonSubscribeLinks')) {
            this.results.passed.push('✅ Classe AmazonSubscribeLinks implementada');

            const linkTypes = [
                'subscribe:',
                'subscribeCart:',
                'maxDiscount:',
                'monthlySubscribe:',
                'originalWithTag:'
            ];

            let foundTypes = 0;
            for (const type of linkTypes) {
                if (content.includes(type)) {
                    foundTypes++;
                }
            }

            if (foundTypes === 5) {
                this.results.passed.push(`✅ Todos os 5 tipos de links S&S implementados`);
                this.results.metrics.amazonLinkTypes = 5;
            } else {
                this.results.warnings.push(`⚠️ Apenas ${foundTypes}/5 tipos de links S&S encontrados`);
            }

            // Verificar tag afiliado
            if (content.includes('buscabusca0f-20')) {
                this.results.passed.push('✅ Tag afiliado Amazon configurada: buscabusca0f-20');
            }
        } else {
            this.results.failed.push('❌ Classe AmazonSubscribeLinks não encontrada');
        }
    }

    // 6. VALIDAR BUILD E PERFORMANCE
    async validateBuildPerformance() {
        console.log('\n📦 Validando build e performance...');

        const buildPath = path.join(process.cwd(), 'build/static/js');

        if (fs.existsSync(buildPath)) {
            const files = fs.readdirSync(buildPath);
            const mainFile = files.find(f => f.startsWith('main.') && f.endsWith('.js'));

            if (mainFile) {
                const stats = fs.statSync(path.join(buildPath, mainFile));
                const sizeMB = (stats.size / 1024 / 1024).toFixed(2);

                // Verificar se existe versão gzipped
                const gzFile = mainFile + '.gz';
                if (fs.existsSync(path.join(buildPath, gzFile))) {
                    const gzStats = fs.statSync(path.join(buildPath, gzFile));
                    const gzSizeKB = (gzStats.size / 1024).toFixed(2);

                    if (gzStats.size < 200 * 1024) { // < 200KB
                        this.results.passed.push(`✅ Bundle gzipped: ${gzSizeKB}KB (< 200KB meta)`);
                        this.results.metrics.bundleSizeGzipped = gzSizeKB;
                    } else {
                        this.results.warnings.push(`⚠️ Bundle gzipped: ${gzSizeKB}KB (acima da meta 200KB)`);
                    }
                } else {
                    this.results.warnings.push(`⚠️ Arquivo gzipped não encontrado (executar gzip)`);
                }

                this.results.metrics.bundleSize = sizeMB + 'MB';
            }
        } else {
            this.results.warnings.push('⚠️ Build não encontrada (executar npm run build)');
        }
    }

    // 7. VALIDAR LOCAIS DE PERSISTÊNCIA
    async validatePersistenceLocations() {
        console.log('\n💾 Validando locais de persistência...');

        const trackingPath = path.join(process.cwd(), 'src/utils/eternal-tracking.js');
        const content = fs.readFileSync(trackingPath, 'utf-8');

        const persistenceMethods = [
            'localStorage.setItem',
            'sessionStorage.setItem',
            'document.cookie',
            'indexedDB.open',
            'caches.open',
            'window.name',
            'history.pushState',
            'navigator.sendBeacon',
            'fetch.*sync',
            'postMessage',
            'BroadcastChannel',
            'SharedWorker',
            'WebSQL', // deprecated mas ainda funciona
            'FileSystem', // Chrome only
            'navigator.storage'
        ];

        let foundLocations = 0;
        const found = [];

        for (const method of persistenceMethods) {
            const regex = new RegExp(method, 'i');
            if (regex.test(content)) {
                found.push(method.split('.')[0]);
                foundLocations++;
            }
        }

        if (foundLocations >= 10) {
            this.results.passed.push(`✅ ${foundLocations} locais de persistência implementados`);
            this.results.metrics.persistenceLocations = foundLocations;
            console.log('   Locais encontrados:', found.join(', '));
        } else {
            this.results.warnings.push(`⚠️ Apenas ${foundLocations} locais de persistência (meta: 15+)`);
        }
    }

    // 8. VALIDAR MONITORAMENTO
    async validateMonitoring() {
        console.log('\n📊 Validando sistema de monitoramento...');

        const dashboardPath = path.join(process.cwd(), 'src/components/MonitoringDashboard.jsx');

        if (fs.existsSync(dashboardPath)) {
            const content = fs.readFileSync(dashboardPath, 'utf-8');

            // Verificar métricas essenciais
            const metrics = [
                'totalClicks',
                'conversionRate',
                'cookiePersistence',
                'deviceAnalysis',
                'topLinks'
            ];

            for (const metric of metrics) {
                if (content.includes(metric)) {
                    this.results.passed.push(`✅ Métrica '${metric}' implementada`);
                }
            }

            // Verificar atualização automática
            if (content.includes('setInterval') && content.includes('60000')) {
                this.results.passed.push('✅ Atualização automática a cada 60 segundos');
            }
        }
    }

    // GERAR RELATÓRIO FINAL
    generateReport() {
        const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);

        console.log('\n' + '='.repeat(70));
        console.log('📊 RELATÓRIO DE VALIDAÇÃO - ETERNAL TRACKING SYSTEM');
        console.log('='.repeat(70));

        console.log('\n✅ TESTES PASSADOS:', this.results.passed.length);
        this.results.passed.forEach(test => console.log('   ' + test));

        if (this.results.warnings.length > 0) {
            console.log('\n⚠️  AVISOS:', this.results.warnings.length);
            this.results.warnings.forEach(warning => console.log('   ' + warning));
        }

        if (this.results.failed.length > 0) {
            console.log('\n❌ FALHAS:', this.results.failed.length);
            this.results.failed.forEach(fail => console.log('   ' + fail));
        }

        console.log('\n📈 MÉTRICAS COLETADAS:');
        Object.entries(this.results.metrics).forEach(([key, value]) => {
            console.log(`   ${key}: ${value}`);
        });

        // Score final
        const totalTests = this.results.passed.length + this.results.failed.length;
        const score = Math.round((this.results.passed.length / totalTests) * 100);

        console.log('\n' + '='.repeat(70));
        console.log(`🏆 SCORE FINAL: ${score}% (${this.results.passed.length}/${totalTests} testes)`);
        console.log(`⏱️  Tempo de execução: ${duration}s`);

        if (score === 100) {
            console.log('\n🔥 SISTEMA 100% VALIDADO - PRONTO PARA PRODUÇÃO!');
        } else if (score >= 90) {
            console.log('\n✅ Sistema aprovado com pequenos ajustes recomendados');
        } else if (score >= 70) {
            console.log('\n⚠️  Sistema funcional mas requer melhorias');
        } else {
            console.log('\n❌ Sistema requer correções críticas');
        }

        console.log('='.repeat(70) + '\n');

        // Salvar relatório em arquivo
        const reportPath = path.join(process.cwd(), 'validation-report.json');
        fs.writeFileSync(reportPath, JSON.stringify({
            timestamp: new Date().toISOString(),
            score: score + '%',
            duration: duration + 's',
            ...this.results
        }, null, 2));

        console.log(`📄 Relatório salvo em: ${reportPath}`);

        return score;
    }

    // EXECUTAR VALIDAÇÃO COMPLETA
    async runFullValidation() {
        console.log('🚀 Iniciando validação completa do Eternal Tracking System...\n');

        await this.validateFileStructure();
        await this.validatePersistenceConfig();
        await this.validateFingerprinting();
        await this.validateServiceWorker();
        await this.validateAmazonIntegration();
        await this.validateBuildPerformance();
        await this.validatePersistenceLocations();
        await this.validateMonitoring();

        const score = this.generateReport();

        // Exit code baseado no score
        process.exit(score === 100 ? 0 : 1);
    }
}

// EXECUTAR
const validator = new EternalSystemValidator();
validator.runFullValidation().catch(error => {
    console.error('❌ Erro na validação:', error);
    process.exit(1);
});