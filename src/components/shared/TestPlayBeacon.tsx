import { useEffect } from "react";
import { recordTestOpened } from "@/lib/user/test-achievements";

export default function TestPlayBeacon({ testId }: { testId: string }) {
  useEffect(() => {
    if (testId) recordTestOpened(testId);
  }, [testId]);
  return null;
}
