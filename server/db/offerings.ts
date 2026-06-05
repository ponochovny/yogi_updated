export const getOfferings = <T>(): Promise<T> => {
	return new Promise((r) => r([] as T))
}
