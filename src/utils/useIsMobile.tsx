import { useEffect, useState } from "react";

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      const mediaQuery = window.matchMedia("(max-width: 480px)");
      setIsMobile(mediaQuery.matches);
    };

    checkIsMobile(); // Initial check
    window.addEventListener("resize", checkIsMobile); // Add event listener

    return () => {
      window.removeEventListener("resize", checkIsMobile); // Clean up event listener on component unmount
    };
  }, []);

  return isMobile;
};

export default useIsMobile;
