const { randomUUID } = require('node:crypto');

const DEMO_STATUSES = new Set(['approved', 'rejected', 'pending', 'error']);

function normalize_demo_scenario(value) {
    const scenario = String(value || '').trim().toLowerCase();
    return DEMO_STATUSES.has(scenario) ? scenario : null;
}

class DemoPaymentProvider {
    constructor() {
        this.name = 'demo';
        this.mode = 'demo';
        this.configured = true;
    }

    async create_checkout({ order_id }) {
        return {
            preference_id: `demo_order_${order_id}`,
            checkout_url: null,
            requires_demo_payment: true
        };
    }

    async process_payment({ order_id, scenario }) {
        const status = normalize_demo_scenario(scenario);
        if (!status) {
            const error = new Error('Escenario demo invalido.');
            error.code = 'DEMO_SCENARIO_INVALID';
            throw error;
        }
        return {
            id: `demo_${randomUUID()}`,
            order_id,
            status,
            status_detail: `demo_${status}`,
            paid_at: status === 'approved' ? new Date().toISOString() : null
        };
    }
}

module.exports = { DemoPaymentProvider, normalize_demo_scenario };
