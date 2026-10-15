export type Post = { id:string; title:string; content:string; author:string; category:string; created_at:string; likes:number; image:string; user_id?:string; };
export const categories=['전체','식물 자랑','질문 있어요','가드닝 팁','나눔 이야기'];
export const seedPosts:Post[]=[
{id:'sample-1',title:'드디어, 몬스테라에 새 잎이 났어요!',content:'매일 아침 조금씩 펼쳐지는 잎을 구경하는 게 요즘의 작은 행복이에요. 밝은 간접광이 드는 창가에서 키우고, 흙이 충분히 말랐는지 확인한 뒤 물을 줬어요. 여러분의 초록 친구들은 잘 자라고 있나요?',author:'초록집사',category:'식물 자랑',created_at:'2026-10-15T02:00:00Z',likes:128,image:'monstera'},
{id:'sample-2',title:'가을 분갈이, 이것만 기억하세요',content:'분갈이는 식물이 건강하게 자랄 때 진행해 주세요. 지금 화분보다 한 치수 큰 화분을 고르고, 배수구를 확인해요. 뿌리를 너무 많이 건드리지 않고 새 흙을 가볍게 채운 뒤 식물 상태에 맞춰 물을 주세요. 분갈이 직후 강한 직사광은 피해주세요.',author:'오늘도 정원',category:'가드닝 팁',created_at:'2026-10-14T03:00:00Z',likes:96,image:'repot'},
{id:'sample-3',title:'바질 한 포기로 시작한 베란다 텃밭',content:'씨앗부터 키운 바질이 이렇게 풍성해졌어요. 햇빛과 통풍을 챙기고, 위쪽 순을 조금씩 수확했더니 곁가지가 나왔어요. 이번 주말에는 직접 키운 바질로 파스타를 만들어 보려고요!',author:'바질러버',category:'식물 자랑',created_at:'2026-10-13T04:00:00Z',likes:74,image:'basil'},
{id:'sample-4',title:'잎 끝이 갈색으로 변했어요. 왜 그럴까요?',content:'스파티필룸을 키우고 있는데 잎 끝이 조금 말랐어요. 물은 흙 상태를 보고 주고 있어요. 습도와 바람, 비료 양을 먼저 확인해 보라는 이야기를 들었는데 비슷한 경험이 있으신가요?',author:'새싹초보',category:'질문 있어요',created_at:'2026-10-12T05:00:00Z',likes:32,image:'peace'},
{id:'sample-5',title:'물꽂이로 뿌리 내린 스킨답서스 나눠요',content:'가지치기한 스킨답서스가 건강하게 뿌리를 내렸어요. 처음 식물을 키워보고 싶은 이웃과 작은 기쁨을 나누고 싶어요. 나눔 전에는 식물 상태를 함께 확인하고 안전한 공개 장소에서 만나요.',author:'느린정원',category:'나눔 이야기',created_at:'2026-10-11T06:00:00Z',likes:51,image:'cutting'},
{id:'sample-6',title:'물을 주기 전, 손가락으로 흙을 확인해요',content:'달력에 정해진 날마다 물을 주기보다 흙과 식물을 살펴보세요. 표면만 보고 판단하지 말고 손가락이나 나무 막대로 속흙의 수분도 확인해요. 식물 종류, 계절, 화분에 따라 물주기 간격은 달라져요.',author:'식물연구소',category:'가드닝 팁',created_at:'2026-10-10T07:00:00Z',likes:113,image:'watering'}];
export const sampleRanks=[{id:'r1',nickname:'초록집사',score:100},{id:'r2',nickname:'느린정원',score:80},{id:'r3',nickname:'바질러버',score:60}];
