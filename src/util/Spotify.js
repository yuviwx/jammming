
const Client_Id  = '2be4c4098af9489fbbb7e257335b3fe0';
const Redirect_Uri = "https://plus-ultra-playlist.netlify.app";

let accessToken;

 const Spotify = {
    getAccessToken(term) {
        if(accessToken){
            return accessToken;
        }

        const accessTokenMatch = window.location.href.match(/access_token=([^&]+)/);
        const expiresInMatch = window.location.href.match(/expires_in=([^&]+)/);
        
        if(accessTokenMatch && expiresInMatch) {
            accessToken = accessTokenMatch[1];
            const expires_in = Number(expiresInMatch[1]);

            window.setTimeout(() => accessToken='', expires_in*1000);
            window.history.pushState('Access Token', null, '/');
            return accessToken;
        }else{
            const accessUrl = `https://accounts.spotify.com/authorize?client_id=${Client_Id}&response_type=token&scope=playlist-modify-public&redirect_uri=${Redirect_Uri}`;
            localStorage.setItem('term',term);
            window.location = accessUrl;
        }
    },

    async search(term){
        const url = `https://api.spotify.com/v1/search?type=track&q=${term}`;
        const access_token = Spotify.getAccessToken(term);
        try{
            const response = await fetch(url, {
                headers:{Authorization: `Bearer ${access_token}`}
            });
            if(response.ok){
                const jsonResponse = await response.json();
                if(!jsonResponse.tracks){
                    return [];
                }
                console.log(jsonResponse.tracks)
                return jsonResponse.tracks.items.map(track => ({
                    id: track.id,
                    name: track.name,
                    artist: track.artists[0].name,
                    album: track.album.name,
                    uri: track.uri
                }));

            }

        }catch(e) {
            throw(e);
        }
    },

    async savePlaylist(name, uris){
        if(!name || !uris){
            return;
        }
        const access_token = Spotify.getAccessToken();
        const headers= {Authorization: `Bearer ${access_token}`};
        let userId;
        let playlistID;

        try{
            const response = await fetch('https://api.spotify.com/v1/me', {
                headers: headers
            });
            if(response.ok){
                const jsonResponse = await response.json();
                userId = jsonResponse.id;
            }
        }catch(e){
            console.log(e);
            return;
        }

        try{
            const response2 = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`,{
                method: 'POST',
                body: JSON.stringify({ name: name}),
                headers: headers
            })
            if(response2.ok){
                const jsonResponse2 = await response2.json();
                playlistID = jsonResponse2.id;
            }
        }catch(e){
            console.log(e);
            return;
        }

        try{
            return fetch(`https://api.spotify.com/v1/playlists/${playlistID}/tracks`, {
                headers: headers,
                method: 'POST',
                body: JSON.stringify({uris: uris})
            })

        }catch(e){
            console.log(e);
            return;
        }
    }
}; 
export default Spotify;