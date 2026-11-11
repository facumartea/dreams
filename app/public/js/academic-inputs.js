// da formato a los campos ficticios de tarjeta; nunca envia ni guarda esos datos.
// mascaras locales: solo memoria del formulario; nunca red, storage ni analitica.
function extraer_digitos_del_formulario(value, limit) { return String(value).replace(/[^0-9]/g, '').slice(0, limit); }
function dar_formato_al_campo(value, kind) {
    const raw = extraer_digitos_del_formulario(value, kind === 'number' ? 16 : kind === 'expiry' ? 4 : 3);
    if (kind === 'number') return raw.replace(/(.{4})(?=.)/g, '$1 ');
    return kind === 'expiry' && raw.length > 2 ? raw.slice(0, 2) + '/' + raw.slice(2) : raw;
}
function preparar_mascara_del_campo(input, kind) {
    input.addEventListener('paste', event => {
        const pasted = event.clipboardData?.getData('text');
        if (typeof pasted !== 'string') return;
        event.preventDefault();
        input.setRangeText(pasted, input.selectionStart, input.selectionEnd, 'end');
        input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    input.addEventListener('beforeinput', event => {
        // borrar junto al separador tambien elimina un digito, sin atrapar el cursor.
        const at = input.selectionStart;
        if (event.inputType !== 'deleteContentBackward' || at !== input.selectionEnd || !at || !/[ /]/.test(input.value[at - 1])) return;
        event.preventDefault(); input.setRangeText('', Math.max(0, at - 2), at, 'end');
        input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    input.addEventListener('input', () => {
        const before = extraer_digitos_del_formulario(input.value.slice(0, input.selectionStart), 99).length;
        input.value = dar_formato_al_campo(input.value, kind);
        let at = 0, seen = 0;
        while (at < input.value.length && seen < before) if (/[0-9]/.test(input.value[at++])) seen++;
        input.setSelectionRange(at, at);
        input.setCustomValidity('');
    });
}
function son_validos_los_campos_academicos() {
    const number = document.getElementById('demo-card-number');
    const expiry = document.getElementById('demo-card-expiry');
    const cvv = document.getElementById('demo-card-cvv');
    const valid = extraer_digitos_del_formulario(number.value, 99).length === 16 && /^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(expiry.value) && /^[0-9]{3}$/.test(cvv.value);
    return valid;
}
document.addEventListener('DOMContentLoaded', () => {
    for (const [id, kind] of [['number', 'number'], ['expiry', 'expiry'], ['cvv', 'cvv']]) preparar_mascara_del_campo(document.getElementById('demo-card-' + id), kind);
});
