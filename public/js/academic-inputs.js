// Máscaras locales: sólo memoria del formulario; nunca red, storage ni analítica.
function academic_digits(value, limit) { return String(value).replace(/[^0-9]/g, '').slice(0, limit); }
function academic_format(value, kind) {
    const raw = academic_digits(value, kind === 'number' ? 16 : kind === 'expiry' ? 4 : 3);
    if (kind === 'number') return raw.replace(/(.{4})(?=.)/g, '$1 ');
    return kind === 'expiry' && raw.length > 2 ? raw.slice(0, 2) + '/' + raw.slice(2) : raw;
}
function academic_mask(input, kind) {
    input.addEventListener('beforeinput', event => {
        // Borrar junto al separador también elimina un dígito, sin atrapar el cursor.
        const at = input.selectionStart;
        if (event.inputType !== 'deleteContentBackward' || at !== input.selectionEnd || !at || !/[ /]/.test(input.value[at - 1])) return;
        event.preventDefault(); input.setRangeText('', Math.max(0, at - 2), at, 'end');
        input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    input.addEventListener('input', () => {
        const before = academic_digits(input.value.slice(0, input.selectionStart), 99).length;
        input.value = academic_format(input.value, kind);
        let at = 0, seen = 0;
        while (at < input.value.length && seen < before) if (/[0-9]/.test(input.value[at++])) seen++;
        input.setSelectionRange(at, at);
        input.setCustomValidity('');
    });
}
function academic_input_valid() {
    const number = document.getElementById('demo-card-number');
    const expiry = document.getElementById('demo-card-expiry');
    const cvv = document.getElementById('demo-card-cvv');
    const valid = academic_digits(number.value, 99).length === 16 && /^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(expiry.value) && /^[0-9]{3}$/.test(cvv.value);
    return valid;
}
document.addEventListener('DOMContentLoaded', () => {
    for (const [id, kind] of [['number', 'number'], ['expiry', 'expiry'], ['cvv', 'cvv']]) academic_mask(document.getElementById('demo-card-' + id), kind);
});
