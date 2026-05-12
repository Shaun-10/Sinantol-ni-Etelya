import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from "react";
import { supabase } from "@lib/supabase";
import { Rider } from "./riderModalShared";

interface ReassignRiderModalProps {
  riders: Rider[];
  onClose: () => void;
  onReassigned: () => Promise<void> | void;
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }

  return fallback;
}

const AREA_OPTIONS = [
  "Taguig",
  "Manila",
  "Quezon City",
  "Makati",
  "Marikina",
  "Parañaque",
];

export default function ReassignRiderModal({
  riders,
  onClose,
  onReassigned,
}: ReassignRiderModalProps): JSX.Element {
  const [sourceRiderId, setSourceRiderId] = useState("");
  const [targetArea, setTargetArea] = useState("");
  const [firstSwapRiderId, setFirstSwapRiderId] = useState("");
  const [secondSwapRiderId, setSecondSwapRiderId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const sourceRider = useMemo(
    () => riders.find((rider) => rider.id === sourceRiderId) ?? null,
    [riders, sourceRiderId],
  );
  const firstSwapRider = useMemo(
    () => riders.find((rider) => rider.id === firstSwapRiderId) ?? null,
    [riders, firstSwapRiderId],
  );
  const secondSwapRider = useMemo(
    () => riders.find((rider) => rider.id === secondSwapRiderId) ?? null,
    [riders, secondSwapRiderId],
  );

  useEffect(() => {
    setTargetArea("");
  }, [sourceRider]);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    if (isSubmitting) return;

    setErrorMessage("");

    if (!sourceRiderId) {
      setErrorMessage("Please select a source rider.");
      return;
    }

    const trimmedArea = targetArea.trim();

    if (!trimmedArea) {
      setErrorMessage("Please select a target area.");
      return;
    }

    if (
      sourceRider &&
      sourceRider.area?.trim().toLowerCase() === trimmedArea.toLowerCase()
    ) {
      setErrorMessage("Choose a different area from the current one.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from("riders")
        .update({ area: trimmedArea })
        .eq("id", sourceRiderId)
        .select();

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error("Update failed. Rider not found.");
      }

      await onReassigned();

      window.confirm(
        `Updated ${sourceRider?.name || "the rider"} to ${trimmedArea}.`,
      );

      // ✅ reset
      setSourceRiderId("");
      setTargetArea("");

      onClose();
    } catch (error: unknown) {
      console.error("Error reassigning rider area:", error);

      setErrorMessage(getErrorMessage(error, "Failed to update rider area."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSwapAreas = async (): Promise<void> => {
    if (isSubmitting) return;

    setErrorMessage("");

    if (!firstSwapRiderId || !secondSwapRiderId) {
      setErrorMessage("Please select two riders to swap.");
      return;
    }

    if (firstSwapRiderId === secondSwapRiderId) {
      setErrorMessage("Choose two different riders to swap areas.");
      return;
    }

    if (!firstSwapRider || !secondSwapRider) {
      setErrorMessage("Unable to find one of the selected riders.");
      return;
    }

    const firstArea = firstSwapRider.area?.trim() || null;
    const secondArea = secondSwapRider.area?.trim() || null;

    if ((firstArea || "").toLowerCase() === (secondArea || "").toLowerCase()) {
      setErrorMessage("These riders already have the same area.");
      return;
    }

    setIsSubmitting(true);

    try {
      const [firstUpdate, secondUpdate] = await Promise.all([
        supabase
          .from("riders")
          .update({ area: secondArea })
          .eq("id", firstSwapRiderId)
          .select(),
        supabase
          .from("riders")
          .update({ area: firstArea })
          .eq("id", secondSwapRiderId)
          .select(),
      ]);

      if (firstUpdate.error) throw firstUpdate.error;
      if (secondUpdate.error) throw secondUpdate.error;

      if (!firstUpdate.data?.length || !secondUpdate.data?.length) {
        throw new Error(
          "Swap failed. One of the selected riders was not found.",
        );
      }

      await onReassigned();

      window.confirm(
        `Swapped areas for ${firstSwapRider.name || "the first rider"} and ${secondSwapRider.name || "the second rider"}.`,
      );

      setFirstSwapRiderId("");
      setSecondSwapRiderId("");

      onClose();
    } catch (error: unknown) {
      console.error("Error swapping rider areas:", error);

      setErrorMessage(getErrorMessage(error, "Failed to swap rider areas."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reassign-rider-title"
    >
      <div className="flex max-h-[90vh] w-11/12 max-w-xl flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h3
              id="reassign-rider-title"
              className="text-xl font-bold text-gray-900"
            >
              Reassign Rider Area
            </h3>
            <p className="text-sm text-gray-500">
              Move one rider or swap two riders between areas.
            </p>
          </div>
          <button
            type="button"
            className="text-2xl text-gray-400 hover:text-gray-600"
            aria-label="Close reassign rider modal"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <div className="space-y-5 overflow-y-auto px-6 py-6">
            {errorMessage && (
              <div className="rounded border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                {errorMessage}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-gray-700">
                  Rider
                </span>
                <select
                  value={sourceRiderId}
                  onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                    setSourceRiderId(event.target.value)
                  }
                  className="rider-input"
                  required
                >
                  <option value="">Select rider</option>
                  {riders.map((rider) => (
                    <option key={rider.id} value={rider.id}>
                      {rider.name || "Unnamed rider"}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-gray-700">
                  New Area
                </span>
                <select
                  value={targetArea}
                  onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                    setTargetArea(event.target.value)
                  }
                  className="rider-input"
                  required
                  disabled={!sourceRiderId}
                >
                  <option value="">Select area</option>
                  {AREA_OPTIONS.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {sourceRider
                ? `${sourceRider.name || "The selected rider"} is currently assigned to ${sourceRider.area || "no area"}. Choose a different area to update the rider's assignment.`
                : "Select a source rider to continue."}
            </div>

            <section className="space-y-4 border-t border-gray-200 pt-5">
              <div>
                <h4 className="text-base font-bold text-gray-900">
                  Swap Rider Areas
                </h4>
                <p className="text-sm text-gray-500">
                  Select two riders to exchange their current areas.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-gray-700">
                    First Rider
                  </span>
                  <select
                    value={firstSwapRiderId}
                    onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                      setFirstSwapRiderId(event.target.value)
                    }
                    className="rider-input"
                    disabled={isSubmitting}
                  >
                    <option value="">Select rider</option>
                    {riders.map((rider) => (
                      <option
                        key={rider.id}
                        value={rider.id}
                        disabled={rider.id === secondSwapRiderId}
                      >
                        {rider.name || "Unnamed rider"}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-gray-700">
                    Second Rider
                  </span>
                  <select
                    value={secondSwapRiderId}
                    onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                      setSecondSwapRiderId(event.target.value)
                    }
                    className="rider-input"
                    disabled={isSubmitting}
                  >
                    <option value="">Select rider</option>
                    {riders.map((rider) => (
                      <option
                        key={rider.id}
                        value={rider.id}
                        disabled={rider.id === firstSwapRiderId}
                      >
                        {rider.name || "Unnamed rider"}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
                {firstSwapRider && secondSwapRider
                  ? `${firstSwapRider.name || "First rider"}: ${firstSwapRider.area || "no area"} -> ${secondSwapRider.area || "no area"} | ${secondSwapRider.name || "Second rider"}: ${secondSwapRider.area || "no area"} -> ${firstSwapRider.area || "no area"}`
                  : "Select two riders to preview the area swap."}
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                  onClick={handleSwapAreas}
                  disabled={isSubmitting || riders.length < 2}
                >
                  {isSubmitting ? "Saving..." : "Swap Areas"}
                </button>
              </div>
            </section>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isSubmitting || riders.length < 1}
            >
              {isSubmitting ? "Updating..." : "Update Area"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
