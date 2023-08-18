// deno-lint-ignore-file no-unsafe-finally
// deno-lint-ignore no-explicit-any
export async function promiseThreads<T>(input: T[], func: (x: T) => Promise<any>, threads: number): Promise<void> {
	const wrap = async (x: T, i: number): Promise<number> => {
		try { await func(x) }
		catch (e) { console.error(e) }
		finally { return i }
	}

	const promises: Promise<number>[] = []
	let i: number
	for (i = 0; i < Math.min(input.length, threads); ++i)
		promises.push(wrap(input[ i ], i))
	for (let j = threads; j < input.length; ++j)
		(i = await Promise.race(promises), promises[ i ] = wrap(input[ j ], i))
	await Promise.all(promises)
}

export async function mapManager<T, U>(input: T[], func: (x: T) => Promise<U>, threads: number): Promise<(U | undefined)[]> {
	const wrap = async (x: T, i: number, j: number): Promise<number> => {
		try { input[ j ] = await func(x) as T }
		catch (e) {
			input[ j ] = undefined as T
			console.error(e)
		}
		finally { return i }
	}

	const promises: Promise<number>[] = []
	let i: number
	for (i = 0; i < Math.min(input.length, threads); ++i)
		promises.push(wrap(input[ i ], i, i))
	for (let j = threads; j < input.length; ++j)
		(i = await Promise.race(promises), promises[ i ] = wrap(input[ j ], i, j))
	await Promise.all(promises)
	return input as unknown as U[]
}
