import { NextRequest, NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const runtime="nodejs";

function safe(value:string){return value.replace(/[\\/:*?"<>|]/g,"_").replace(/\s+/g,"_").slice(0,120)}

export async function GET(request:NextRequest){
  const project=request.nextUrl.searchParams.get("project");const file=request.nextUrl.searchParams.get("file");
  if(!project||!file)return NextResponse.json({error:"파일 정보가 없습니다."},{status:400});
  try{const filename=safe(file);const data=await readFile(path.join(process.cwd(),"storage",safe(project),filename));const ext=path.extname(filename);const contentType=ext===".docx"?"application/vnd.openxmlformats-officedocument.wordprocessingml.document":ext===".pptx"?"application/vnd.openxmlformats-officedocument.presentationml.presentation":"application/json; charset=utf-8";return new NextResponse(data,{headers:{"Content-Type":contentType,"Content-Disposition":`attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,"Cache-Control":"no-store"}})}catch{return NextResponse.json({error:"파일을 찾을 수 없습니다."},{status:404})}
}
