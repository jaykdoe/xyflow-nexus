
// import React from "react";
// import { motion } from "motion/react";
// import { cn } from "@/lib/utils";

// interface ShiningDivProps {
//   children?: any;
//   // add any other props you need here
//   className?: string;
//   style?: React.CSSProperties;
//   onClick?: () => void;
// }

// const ShiningDiv: React.FC<ShiningDivProps> = ({ className, children, style, onClick }) => {
//   return (
//     <motion.div
//       onClick={onClick}
//       style={style}
//       initial={{ scale: 0.7 }}
//       animate={{ scale: 1 }}
//       exit={{ scale: 0.7 }}
//       transition={{
//         type: "spring",
//         stiffness: 260,
//         damping: 20,
//       }}
//       className={cn(
//         "bg-black-transparent flex w-full items-center justify-center space-x-3 hover:cursor-pointer",
//       )}
//     >
//       <div className="animation-delay-[2000ms] animation-duration-[500ms] group cursor-pointer border-none bg-transparent transition-all">
//         <div
//           className={cn(
//             "relative flex h-full w-full items-center justify-center overflow-hidden bg-transparent font-bold text-white",
//             className,
//           )}
//         >
//           {children}
//           <div
//             className={cn(
//               "absolute -left-32 -top-4 h-[200%] w-12 rotate-30 scale-y-150 bg-white/30 transition-all delay-2700 duration-700 ease-in-out group-hover:left-[calc(100%+1rem)]",
//             )}
//           />
//           <div
//             className={cn(
//               "absolute -left-32 -top-4 h-[200%] w-4 rotate-30 scale-y-150 bg-white/30 transition-all delay-3000 duration-700 ease-in-out group-hover:left-[calc(100%+1rem)]",
//             )}
//           />
//         </div>
//       </div>
//     </motion.div>
//   );
// };
// export default ShiningDiv;
