// Visibility is a consent marker; current public references determine anonymous access.
export async function publiclyReferenced(client,id){
 const r=await client.query(`SELECT 1 WHERE EXISTS (
 SELECT 1 FROM start_app.content WHERE published IS NOT NULL AND (published->'mediaIds') ? $1
 ) OR EXISTS (
 SELECT 1 FROM start_app.contributions x JOIN start_app.content p ON p.id=x.place_id JOIN start_app.content a ON a.id=x.artist_id WHERE p.published IS NOT NULL AND a.published IS NOT NULL AND (x.data->'mediaIds') ? $1
 ) OR EXISTS (
 SELECT 1 FROM start_app.listings l JOIN start_app.communities c ON c.id=l.community_id JOIN start_accounts.users u ON u.id=l.user_id WHERE l.status='available' AND c.status='active' AND u.status='active' AND (l.data->'mediaIds') ? $1
 )`,[id]);return r.rowCount>0;
}
export async function reviewableMedia(client,id){const r=await client.query(`SELECT 1 WHERE EXISTS(SELECT 1 FROM start_app.submissions s JOIN start_accounts.users u ON u.id=s.user_id WHERE s.status='pending' AND u.status='active' AND (s.data->'mediaIds') ? $1) OR EXISTS(SELECT 1 FROM start_app.corrections c JOIN start_accounts.users u ON u.id=c.user_id WHERE c.status='pending' AND u.status='active' AND (c.data->'data'->'mediaIds') ? $1)`,[id]);return r.rowCount>0;}
