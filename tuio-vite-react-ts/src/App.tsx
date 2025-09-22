import { useEffect, useRef, useState } from 'react'
import './App.css'

import { OscJsWebsocketTuioReceiver, Tuio20Client, Tuio20Object } from "tuio-client";

const hostname = 'localhost';
const port = 3343;

function App() {
  const tuio20Client = useRef(null as Tuio20Client | null);
  const [tuioObjects, setTuioObjects] = useState([] as Tuio20Object[]);

  const getTuio20Client = () => {
    if (tuio20Client.current) return tuio20Client.current;

    const client = new Tuio20Client(new OscJsWebsocketTuioReceiver(hostname, port));
    client.addTuioListener({
      tuioAdd: (tuioObject: Tuio20Object) => { setTuioObjects((prevObjects) => [...prevObjects, tuioObject]) },
      tuioUpdate: (tuioObject: Tuio20Object) => { setTuioObjects((prevObjects) => [...prevObjects.map(obj => obj._sessionId === tuioObject._sessionId ? tuioObject : obj)]) },
      tuioRemove: (tuioObject: Tuio20Object) => { setTuioObjects((prevObjects) => [...prevObjects.filter(obj => obj._sessionId !== tuioObject._sessionId)]) },
      tuioRefresh: () => { /* ignore the TUIO time for now */ }
    });
    client.connect();

    tuio20Client.current = client;

    return client;
  };

  useEffect(() => {
    const _client = getTuio20Client();

    // TODO: Enable the clean-up function below -- this currently breaks due to useEffect being called twice during development in React when using <StrictMode>
    return () => {
      // client.disconnect();
    }
  }, []);

  const pointers = tuioObjects.filter(o => o.pointer !== null).map(o => o.pointer);
  const tokens = tuioObjects.filter(o => o.token !== null).map(o => o.token);

  return (
    <>
      <h1>TUIO 2.0</h1>
      <div className="card">
        <svg width={800} height={600} style={{ border: '1px solid black' }}>
          {pointers.map(pointer => (
            <circle key={pointer?.sessionId} cx={pointer?.position.x * 800} cy={pointer?.position.y * 600} r="20" fill="blue" />
          ))}
        </svg>

        {pointers.length > 0 && <><h2>Pointers:</h2>
          <pre>
            {pointers.map(pointer => JSON.stringify({ x: pointer?.position.x, y: pointer?.position.y })).join('\n')}
          </pre>
        </>}

        {tokens.length > 0 && <><h2>Objects:</h2>
          <pre>
            {tokens.map(token => JSON.stringify({ x: token?.position.x, y: token?.position.y, id: token?.cId })).join('\n')}
          </pre>
        </>}
      </div>
    </>
  )
}

export default App
