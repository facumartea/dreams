const project = 'https://nwsmbemwtexmrtpkgxrz.supabase.co';
const checks = ['registration', 'sessions', 'cart_isolation', 'review_ownership', 'admin_persistence', 'academic_compatibility'];
export function official_release_ready(release, now = Date.now()) {
    if (release.deployment_ready !== true || release.official_service !== 'dreams-official-backend') return false;
    const read = release.candidate_read, qa = release.authenticated_qa;
    if (!read || read.status !== 200 || read.project_url !== project || read.backend_version !== release.official_version) return false;
    const age = now - Date.parse(read.checked_at);
    if (!Number.isFinite(age) || age < 0 || age > 3600000) return false;
    return qa?.backend_version === release.official_version && checks.every(name => qa[name] === true);
}
