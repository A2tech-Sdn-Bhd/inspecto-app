import { MdFullscreen } from "react-icons/md";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
const BtnFullscreen = () => {

    return (
        
            <button 
            className="btn btn-neutral tooltip tooltip-bottom " 
            data-tip="toggle fullscreen" 
            onClick={() =>
            useFullScreenHandle.enter
            }>
            <MdFullscreen color="white" size={30} />
            
          </button>


    )
}

export default BtnFullscreen;
