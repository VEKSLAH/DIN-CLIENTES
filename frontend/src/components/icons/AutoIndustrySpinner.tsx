import Lottie from "lottie-react";
import { AnimationTurbo } from "./AnimationTurbo";

const Spinner = ({ classNames }: { classNames: string }) => {
  return (
    <div className="flex justify-center items-center h-24 drop-shadow-2xl rounded-full">
      <Lottie
        animationData={AnimationTurbo}
        loop={true}
        className={classNames}
      />
    </div>
  );
};

export default Spinner;
