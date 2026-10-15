create extension if not exists pgcrypto;
create table if not exists public.posts (
 id uuid primary key default gen_random_uuid(),
 title text not null check (char_length(title) between 1 and 120),
 content text not null check (char_length(content) between 5 and 5000),
 author text not null check (char_length(author) between 1 and 30),
 created_at timestamptz not null default now(),
 likes integer not null default 0 check (likes >= 0),
 user_id uuid references auth.users(id) on delete set null,
 category text not null default '식물 자랑' check (category in ('식물 자랑','질문 있어요','가드닝 팁','나눔 이야기')),
 image text not null default 'monstera' check (image in ('monstera','repot','basil','peace','cutting','watering'))
);
create table if not exists public.rankings (
 id uuid primary key default gen_random_uuid(),
 nickname text not null check(char_length(nickname) between 1 and 30),
 score integer not null check(score between 0 and 100 and score % 20 = 0),
 played_at timestamptz not null default now(),
 user_id uuid references auth.users(id) on delete set null
);
create table if not exists public.post_likes (
 post_id uuid references public.posts(id) on delete cascade,
 user_id uuid references auth.users(id) on delete cascade,
 created_at timestamptz not null default now(),
 primary key(post_id,user_id)
);
alter table public.posts enable row level security;
alter table public.rankings enable row level security;
alter table public.post_likes enable row level security;
create policy "Public posts are readable" on public.posts for select to anon,authenticated using(true);
create policy "Members publish as themselves" on public.posts for insert to authenticated with check(user_id=(select auth.uid()) and likes=0 and created_at between now()-interval '1 minute' and now()+interval '1 minute');
create policy "Members remove own posts" on public.posts for delete to authenticated using(user_id=(select auth.uid()));
create policy "Public rankings are readable" on public.rankings for select to anon,authenticated using(true);
create policy "Members submit own quiz result" on public.rankings for insert to authenticated with check(user_id=(select auth.uid()) and played_at between now()-interval '1 minute' and now()+interval '1 minute');
create policy "Members read own likes" on public.post_likes for select to authenticated using(user_id=(select auth.uid()));
grant select on public.posts, public.rankings to anon,authenticated;
grant insert,delete on public.posts to authenticated;
grant insert on public.rankings to authenticated;
grant select on public.post_likes to authenticated;
revoke update on public.posts,public.rankings from anon,authenticated;
revoke insert,update,delete on public.post_likes from anon,authenticated;
create or replace function public.like_post(target_post uuid) returns void language plpgsql security definer set search_path = '' as $$
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 insert into public.post_likes(post_id,user_id) values(target_post,auth.uid()) on conflict do nothing;
 if found then update public.posts set likes=likes+1 where id=target_post; end if;
end; $$;
revoke all on function public.like_post(uuid) from public,anon;
grant execute on function public.like_post(uuid) to authenticated;
create index if not exists posts_created_idx on public.posts(created_at desc);
create index if not exists rankings_score_idx on public.rankings(score desc,played_at);
insert into public.posts(id,title,content,author,category,image,likes) values
('11111111-1111-4111-8111-111111111111','드디어, 몬스테라에 새 잎이 났어요!','매일 아침 조금씩 펼쳐지는 잎을 구경하는 게 요즘의 작은 행복이에요. 밝은 간접광이 드는 창가에서 키우고, 흙이 충분히 말랐는지 확인한 뒤 물을 줬어요. 여러분의 초록 친구들은 잘 자라고 있나요?','초록집사 · 샘플','식물 자랑','monstera',128),
('22222222-2222-4222-8222-222222222222','가을 분갈이, 이것만 기억하세요','분갈이는 식물이 건강하게 자랄 때 진행해 주세요. 지금 화분보다 한 치수 큰 화분을 고르고 배수구를 확인해요. 뿌리를 너무 많이 건드리지 않고 새 흙을 가볍게 채워주세요.','오늘도 정원 · 샘플','가드닝 팁','repot',96),
('33333333-3333-4333-8333-333333333333','바질 한 포기로 시작한 베란다 텃밭','씨앗부터 키운 바질이 이렇게 풍성해졌어요. 햇빛과 통풍을 챙기고 위쪽 순을 조금씩 수확했더니 곁가지가 나왔어요. 이번 주말에는 직접 키운 바질로 파스타를 만들어 보려고요!','바질러버 · 샘플','식물 자랑','basil',74),
('44444444-4444-4444-8444-444444444444','잎 끝이 갈색으로 변했어요. 왜 그럴까요?','스파티필룸을 키우고 있는데 잎 끝이 조금 말랐어요. 물은 흙 상태를 보고 주고 있어요. 습도와 바람, 비료 양을 먼저 확인해 보라는 이야기를 들었는데 비슷한 경험이 있으신가요?','새싹초보 · 샘플','질문 있어요','peace',32),
('55555555-5555-4555-8555-555555555555','물꽂이로 뿌리 내린 스킨답서스 나눠요','가지치기한 스킨답서스가 건강하게 뿌리를 내렸어요. 처음 식물을 키워보고 싶은 이웃과 작은 기쁨을 나누고 싶어요. 나눔 전에는 식물 상태를 함께 확인하고 안전한 공개 장소에서 만나요.','느린정원 · 샘플','나눔 이야기','cutting',51),
('66666666-6666-4666-8666-666666666666','물을 주기 전, 손가락으로 흙을 확인해요','달력에 정해진 날마다 물을 주기보다 흙과 식물을 살펴보세요. 표면만 보고 판단하지 말고 손가락이나 나무 막대로 속흙의 수분도 확인해요. 식물 종류와 계절, 화분에 따라 물주기 간격은 달라져요.','식물연구소 · 샘플','가드닝 팁','watering',113)
on conflict(id) do nothing;
insert into public.rankings(id,nickname,score) values
('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','초록집사 · 샘플',100),
('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','느린정원 · 샘플',80),
('cccccccc-cccc-4ccc-8ccc-cccccccccccc','바질러버 · 샘플',60) on conflict(id) do nothing;
