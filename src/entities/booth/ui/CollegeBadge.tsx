import collegeIcons from "../festival-visuals/college-icons.png";
import { type College } from "../model/booths";

interface CollegeVisual {
  aspectRatio: string;
  background: string;
  imageLeft: string;
  imageTop: string;
  imageHeight: string;
}

const collegeVisuals: Record<College, CollegeVisual> = {
  IT: {
    aspectRatio: "56 / 49",
    background: "linear-gradient(180deg, #fcfcfc 0%, #cfcfcf 100%)",
    imageLeft: "-17.53%",
    imageTop: "-26.43%",
    imageHeight: "253.76%",
  },
  NURSING: {
    aspectRatio: "186 / 171",
    background: "linear-gradient(180deg, #f3c3d3 0%, #ff6b9d 100%)",
    imageLeft: "-122.97%",
    imageTop: "-15.73%",
    imageHeight: "241.52%",
  },
  ART: {
    aspectRatio: "186 / 171",
    background: "linear-gradient(180deg, #ebc3a9 0%, #ff8a3d 99.99%)",
    imageLeft: "-229.93%",
    imageTop: "-17.91%",
    imageHeight: "241.52%",
  },
  SOCIAL: {
    aspectRatio: "186 / 171",
    background: "linear-gradient(180deg, #afe7ec 0%, #00c2d1 100%)",
    imageLeft: "-11.7%",
    imageTop: "-127.68%",
    imageHeight: "241.52%",
  },
  EDU: {
    aspectRatio: "186 / 171",
    background: "linear-gradient(180deg, #f7ebcb 0%, #ffcd49 100%)",
    imageLeft: "-121.2%",
    imageTop: "-127.17%",
    imageHeight: "241.52%",
  },
  NATURE: {
    aspectRatio: "186 / 171",
    background: "linear-gradient(180deg, #b1e8bf 0%, #4fd171 100%)",
    imageLeft: "-227.47%",
    imageTop: "-124.84%",
    imageHeight: "241.52%",
  },
};

interface CollegeBadgeProps {
  college: College;
  size?: "large" | "small";
}

export const CollegeBadge = ({ college, size = "large" }: CollegeBadgeProps) => {
  const visual = collegeVisuals[college];

  return (
    <span
      aria-hidden="true"
      className={`flex items-center justify-center overflow-hidden rounded-full p-2 ${
        size === "large" ? "size-14" : "size-[37.333px]"
      }`}
      style={{ background: visual.background }}
    >
      <span
        className="relative w-full shrink-0 overflow-hidden"
        style={{ aspectRatio: visual.aspectRatio }}
      >
        <img
          alt=""
          className="absolute max-w-none"
          src={collegeIcons}
          style={{
            height: visual.imageHeight,
            left: visual.imageLeft,
            top: visual.imageTop,
            width: "333.06%",
          }}
        />
      </span>
    </span>
  );
};
