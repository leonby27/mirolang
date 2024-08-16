import * as React from "react"
import Svg, {
  Path,
  G,
  Ellipse,
  Mask,
  Defs,
  LinearGradient,
  Stop
} from "react-native-svg"

function FinishedIcon(props) {
  return (
    <Svg
      width={48}
      height={48}
      viewBox="0 0 48 48"
      fill="none"
      {...props}
    >
      <Path
        d="M10.527 24.7a2.292 2.292 0 012.293-2.292h22.689a2.292 2.292 0 012.292 2.293v13.96c0 .967-.606 1.83-1.515 2.157L24.94 44.906c-.502.181-1.052.181-1.554 0l-11.344-4.087a2.293 2.293 0 01-1.516-2.156V24.7z"
        fill="url(#paint0_linear_1860_6845)"
      />
      <G opacity={0.4} filter="url(#filter0_f_1860_6845)">
        <Ellipse
          cx={24.1634}
          cy={22.6587}
          rx={18.3392}
          ry={17.7661}
          fill="#321D13"
        />
      </G>
      <Mask
        id="a"
        style={{
          maskType: "alpha"
        }}
        maskUnits="userSpaceOnUse"
        x={5}
        y={2}
        width={38}
        height={37}
      >
        <Ellipse
          cx={24.1644}
          cy={20.643}
          rx={18.3392}
          ry={17.7661}
          fill="#D9D9D9"
        />
      </Mask>
      <G mask="url(#a)">
        <G filter="url(#filter1_d_1860_6845)">
          <Ellipse
            cx={24.1644}
            cy={20.643}
            rx={18.3392}
            ry={17.7661}
            fill="url(#paint1_linear_1860_6845)"
          />
          <Ellipse
            cx={24.1644}
            cy={20.643}
            rx={18.3392}
            ry={17.7661}
            fill="url(#paint2_linear_1860_6845)"
          />
          <Ellipse
            cx={24.1644}
            cy={20.643}
            rx={18.3392}
            ry={17.7661}
            fill="url(#paint3_linear_1860_6845)"
          />
        </G>
        <Ellipse
          cx={15.5178}
          cy={15.0328}
          rx={15.5178}
          ry={15.0328}
          transform="matrix(1 0 0 -1 8.647 35.674)"
          fill="url(#paint4_linear_1860_6845)"
        />
        <Ellipse
          cx={15.5178}
          cy={15.0328}
          rx={15.5178}
          ry={15.0328}
          transform="matrix(1 0 0 -1 8.647 35.674)"
          fill="url(#paint5_linear_1860_6845)"
        />
        <Ellipse
          cx={15.5178}
          cy={15.0328}
          rx={15.5178}
          ry={15.0328}
          transform="matrix(1 0 0 -1 8.647 35.674)"
          fill="url(#paint6_linear_1860_6845)"
        />
        <Path
          d="M37.802 20.642c0 7.296-6.105 13.211-13.637 13.211-7.531 0-13.637-5.915-13.637-13.21 0-7.297 6.106-13.211 13.637-13.211 7.532 0 13.637 5.914 13.637 13.21z"
          fill="url(#paint7_linear_1860_6845)"
        />
        <Path
          d="M32.023 15.815l-9.825 9.824-4.912-4.912"
          stroke="#fff"
          strokeOpacity={0.8}
          strokeWidth={3.92982}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
      <Defs>
        <LinearGradient
          id="paint0_linear_1860_6845"
          x1={24.1642}
          y1={32.5}
          x2={24.1642}
          y2={45.1852}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#2DC5A9" />
          <Stop offset={1} stopColor="#107361" />
        </LinearGradient>
        <LinearGradient
          id="paint1_linear_1860_6845"
          x1={24.1644}
          y1={2.87695}
          x2={24.1644}
          y2={38.4091}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#FFEF98" />
          <Stop offset={0.529832} stopColor="#FBC15B" />
          <Stop offset={1} stopColor="#F49712" />
        </LinearGradient>
        <LinearGradient
          id="paint2_linear_1860_6845"
          x1={24.1644}
          y1={2.87695}
          x2={24.1644}
          y2={38.4091}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#A6FF98" />
          <Stop offset={0.529832} stopColor="#4BD250" />
          <Stop offset={1} stopColor="#08580B" />
        </LinearGradient>
        <LinearGradient
          id="paint3_linear_1860_6845"
          x1={24.1644}
          y1={2.87695}
          x2={24.1644}
          y2={38.4091}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#90E083" />
          <Stop offset={0.529832} stopColor="#26942A" />
          <Stop offset={1} stopColor="#08440A" />
        </LinearGradient>
        <LinearGradient
          id="paint4_linear_1860_6845"
          x1={15.5178}
          y1={0}
          x2={15.5178}
          y2={30.0657}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#FFEF98" />
          <Stop offset={0.529832} stopColor="#FBC15B" />
          <Stop offset={1} stopColor="#F49712" />
        </LinearGradient>
        <LinearGradient
          id="paint5_linear_1860_6845"
          x1={15.5178}
          y1={0}
          x2={15.5178}
          y2={30.0657}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#A6FF98" />
          <Stop offset={0.529832} stopColor="#4BD250" />
          <Stop offset={1} stopColor="#08580B" />
        </LinearGradient>
        <LinearGradient
          id="paint6_linear_1860_6845"
          x1={15.5178}
          y1={0}
          x2={15.5178}
          y2={30.0657}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#90E083" />
          <Stop offset={0.529832} stopColor="#26942A" />
          <Stop offset={1} stopColor="#08440A" />
        </LinearGradient>
        <LinearGradient
          id="paint7_linear_1860_6845"
          x1={24.1651}
          y1={7.43164}
          x2={24.1651}
          y2={33.853}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#90E083" />
          <Stop offset={0.529832} stopColor="#26942A" />
          <Stop offset={1} stopColor="#08440A" />
        </LinearGradient>
      </Defs>
    </Svg>
  )
}

export default FinishedIcon
