import { test } from 'node:test';
import assert from 'node:assert/strict';
import { create_proxy } from '../pages/proxy.mjs';
const backend_url='https://d5df723d-dreams-perfumes.dreams-perfumes.workers.dev',admin_backend_url='https://12345678-dreams-perfumes.dreams-perfumes.workers.dev';
test('Admin overlay depends on successful upstream authorization and never masks denial',async()=>{
 for(const status of [401,403,503,200]){
  const proxy=create_proxy({'/admin':{body:'protected candidate',content_type:'text/html',etag:'"fixture"'}},{backend_url,admin_backend_url,fetch_backend:async req=>{assert.equal(new URL(req.url).origin,admin_backend_url);return new Response('upstream',{status});}});
  const response=await proxy.fetch(new Request('https://admin-cards-review.dreams-perfumes.pages.dev/admin'),{});
  assert.equal(response.status,status);assert.equal(await response.text(),status===200?'protected candidate':'upstream');
 }
});
test('Admin review target is exact, preserves origin/cookies, commercial traffic stays pinned',async()=>{
 const calls=[],proxy=create_proxy({},{backend_url,admin_backend_url,fetch_backend:async req=>{calls.push(req);return Response.json({});}});
 for(const path of ['/admin','/api/admin/products','/api/auth/login','/api/auth/me','/api/products','/api/cart/quote','/api/checkout/session']){
  await proxy.fetch(new Request('https://admin-cards-review.dreams-perfumes.pages.dev'+path,{headers:{Cookie:'fixture=only',Origin:'https://admin-cards-review.dreams-perfumes.pages.dev'}}),{});
  const req=calls.at(-1),admin=['/admin','/api/admin/products','/api/auth/login','/api/auth/me'].includes(path);assert.equal(new URL(req.url).origin,admin?admin_backend_url:backend_url);assert.equal(req.headers.get('Cookie'),'fixture=only');assert.equal(req.headers.get('Origin'),'https://admin-cards-review.dreams-perfumes.pages.dev');assert.equal(req.redirect,'manual');
 }
});
test('invalid Admin backend fails closed without network',async()=>{
 const proxy=create_proxy({},{backend_url,admin_backend_url:'https://evil.invalid',fetch_backend:()=>assert.fail('network forbidden')});assert.equal((await proxy.fetch(new Request('https://dreams-perfumes.pages.dev/admin'),{})).status,503);
});
