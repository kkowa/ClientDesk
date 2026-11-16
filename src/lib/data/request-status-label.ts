import type { WorkRequestStatus } from "@/src/types/work-request";

export function requestStatusLabel(status: WorkRequestStatus): string {
	return status.replace(/(^|_)([a-z])/g, (match, separator: string, letter: string) => {
		const prefix = separator === "_" ? " " : "";
		return `${prefix}${letter.toUpperCase()}`;
	});
}
