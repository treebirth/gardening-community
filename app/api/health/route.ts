import { NextResponse } from 'next/server';
export function GET(){return NextResponse.json({status:'ok',service:'gardening-community',configuredRegion:'icn1',runtimeRegion:process.env.VERCEL_REGION??'local',databaseConfigured:Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL)})}
