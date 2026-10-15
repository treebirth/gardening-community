import {createClient} from '@supabase/supabase-js';
import {seedPosts} from '@/lib/data';
export async function GET(){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 if(!url||!key)return Response.json({posts:seedPosts,mode:'demo'});
 const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
 const started=performance.now();
 const {data,error}=await db.from('posts').select('id,title,content,author,created_at,likes,category,image').order('created_at',{ascending:false}).limit(100);
 if(error)return Response.json({error:'커뮤니티 데이터를 불러오지 못했습니다.'},{status:503});
 return Response.json({posts:data,mode:'live'},{headers:{'Server-Timing':`database;dur=${(performance.now()-started).toFixed(1)}`,'Cache-Control':'no-store'}});
}
