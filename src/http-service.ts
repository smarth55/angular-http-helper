import {Http} from '@angular/http';
import {Observable} from 'rxjs';


export abstract class HttpBaseService {
	protected cache: any[] = [];
	protected requests: { [key: string]: Observable<any> } = {};

	public getCacheKey(fName: string, ...args: any[]): string {
		let argsString = args.join('_');
		return `${fName}:${argsString}`;
	}

	public clearCache(key?: string): void {
		if ( key ) {
			this.cache = this.cache.filter(item => item.id !== key);
		} else {
			this.cache = [];
		}
	}
}

export function HttpRequest(options?: {cache?: boolean}) {
	if ( !options ) {
		options = {
			cache: false
		}
	}

	return function(target, key, descriptor) {
		let originalFunction = descriptor.value;

		descriptor.value = function(...args: any[]) {
			let argsString = args.join('_');
			let requestKey = `${key}:${argsString}`;

			this.cache = this.cache || [];
			this.requests = this.requests || {};

			let cached = this.cache.filter(item => item.id === requestKey).pop();
			if ( cached ) {
				return Observable.from([cached.data]);
			}

			if ( !this.requests[requestKey] ) {
				this.requests[requestKey] = originalFunction.call(this, ...args).publish().refCount();
			}

			this.requests[requestKey].subscribe((res)=>{
				if ( options.cache ) {
					this.cache.push({
						id: requestKey,
						data: res
					});
				}
				this.requests[requestKey] = null;
			});

			return this.requests[requestKey];
		};

		return descriptor;
	}
}