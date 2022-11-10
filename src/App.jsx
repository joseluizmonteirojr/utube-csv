import { useCallback, useEffect, useState } from 'react';
import { CSVLink } from "react-csv";
import './App.css';

const headers = [
  { label: "Channel", key: "channelName" },
  { label: "Video", key: "videoName" },
  { label: "Link", key: "videoLink" },
];

const YOUTUBE_PLAYLISTS_ITEMS_API = "https://www.googleapis.com/youtube/v3/playlistItems";

function App() {
  const [playlistId, setPlaylistId] = useState('');
  //PLUCb45311vj1GvzFpgbyzKCG3gELl3nf9
  //PLrVhyUnEQMV_DOSqhiyQNo9RdJYbeCLVP
  const [videos, setVideos] = useState([]);
  const [csvData, setCsvData] = useState([]);
  const [error, setError] = useState({message: "Please inform the playlist ID"});

  const getItems = useCallback(async() => {
    try {
      const response = await fetch(`${YOUTUBE_PLAYLISTS_ITEMS_API}?part=snippet&playlistId=${playlistId}&key=${process.env.REACT_APP_YOUTUBE_API_KEY}`);
      const processed = await response.json();
      console.log(processed.error);
      if (processed.error) {
        setError(processed.error);
        setVideos([]);
        setCsvData([]);
      } else {
        setVideos(processed.items);
        setCsvData(processed.items.map(video => ({
          videoName: video.snippet.title,
          channelName: video.snippet.videoOwnerChannelTitle,
          videoLink:`https://www.youtube.com/watch?v=${video.snippet.resourceId.videoId}`
        })));
        setError(null);
      }
    } catch(error) {
      console.error(error);
    }
  }, [playlistId]);

  useEffect(() => {
    if (playlistId) {
      getItems();
    }
  }, [getItems, playlistId]);

  return (
    <div className="app">
      <h3>Playlist ID</h3>
      <input value={playlistId} onChange={(evt) => setPlaylistId(evt.target.value || '')} />
      {error?.message && !videos.length && <p>{error.message}</p>}
      {!error?.message && videos.length &&
        <>
          <CSVLink
              headers={headers}
              filename={`${playlistId}.csv`}
              data={csvData}
            >
              <button>DownLoad CSV</button>
            </CSVLink>
          <dl>
            {videos.map((video) => {
              return (
                <>
                  <dd className="row">
                    <img
                    src={video.snippet.thumbnails.medium.url}
                    width={video.snippet.thumbnails.medium.width}
                    height={video.snippet.thumbnails.medium.height}
                    alt="video-logo" />
                    <div>
                      <h1>
                        <a
                          href={`https://www.youtube.com/channel/${video.snippet.videoOwnerChannelId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          >
                            {video.snippet.videoOwnerChannelTitle}
                        </a>
                      </h1>
                      <h2>
                        <a
                          href={`https://www.youtube.com/watch?v=${video.snippet.resourceId.videoId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          >
                          {video.snippet.title}
                        </a>
                      </h2>
                    </div>
                  </dd>
                </>
              );
            })}
          </dl>
        </>
      }
    </div>
  );
}

export default App;
