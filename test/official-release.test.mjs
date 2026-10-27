import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { create_proxy } from '../pages/proxy.mjs';
test('official Admin publication keeps denied mutations and Auth on the existing production backend', async () => {
    const release=JSON.parse(await readFile(new URL('../pages/official-release.json',import.meta.url),'utf8'));
    assert.equal(release.admin_backend_url,undefined); assert.equal(release.auth_backend_url,undefined);
    const calls=[],proxy=create_proxy({'/admin':{body:'authorized HTML',content_type:'text/html'}},{...release,fetch_backend:async request=>{calls.push(request);return Response.json({error:'backend protection'},{status:403});}});
    for(const [method,path] of [['GET','/admin'],['PUT','/api/admin/products/7'],['POST','/api/auth/register'],['POST','/api/inquiries']]) {
        const req=new Request('https://dreams-perfumes.pages.dev'+path,{method,headers:{Origin:'https://dreams-perfumes.pages.dev'},...(method==='GET'?{}:{body:'{}'})});
        const response=await proxy.fetch(req,{}); assert.equal(response.status,403); assert.deepEqual(await response.json(),{error:'backend protection'});
        assert.equal(new URL(calls.at(-1).url).origin,release.backend_url);assert.equal(calls.at(-1).method,method);
    }
});

test('compressed API bodies are rejected before touching the legacy parser; normal JSON is preserved', async () => {
    let calls=0;
    const backend_url='https://d5df723d-dreams-perfumes.dreams-perfumes.workers.dev';
    const proxy=create_proxy({}, {backend_url,fetch_backend:async request=>{calls++;return Response.json({body:await request.text()});}});
    for(const encoding of ['gzip','deflate','br','GZIP','gzip, identity','unknown']) {
        const response=await proxy.fetch(new Request('https://dreams-perfumes.pages.dev/api/auth/login',{method:'POST',headers:{'Content-Encoding':encoding},body:'compressed fixture'}),{});
        assert.equal(response.status,415);assert.equal(response.headers.get('Cache-Control'),'no-store');
    }
    assert.equal(calls,0);
    for(const headers of [{},{'Content-Encoding':'identity'}]) {
        const response=await proxy.fetch(new Request('https://dreams-perfumes.pages.dev/api/auth/login',{method:'POST',headers,body:'{"fixture":true}'}),{});
        assert.equal(response.status,200); assert.equal((await response.json()).body,'{"fixture":true}');
    }
    assert.equal(calls,2);
});
