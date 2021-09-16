import React, {useState} from 'react';
import ReactDOM from 'react-dom';

const Home = () => {
    const [node, chrome, electron] = useState(0);
    return (
        <div>
            <h1>Memo Desktop!</h1>
            <p>
                We are using Node.js {node},
                Chromium {chrome},
                and Electron {electron}.
            </p>
        </div>
    );
}

ReactDOM.render(<Home/>, document.querySelector('#home'));
