
const VideoStreamPanel = ({canvasRef, cam}) =>{
    return(<div className="col-span-8 items-center justify-center">
        <div
          style={{
            position: "relative",
            width: "100%",
          }}
        >
          {/* Canvas for 2D context */}
          <canvas
             className={`bg-white w-full h-full ${
              cam === 4 ? "hidden" : ""
            }`}
            ref={canvasRef}
            width={1274}
            height={670}
          ></canvas>
        </div>
      </div>)
}

export default VideoStreamPanel;