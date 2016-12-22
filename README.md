# angular-http-helper
This is a base service and decorator to provide some basic functionality to an http-based service. By decorating your service methods, multiple calls with the same parameters are merged until the first request is returned and cached (if set to cache). This is useful if you have multiple components that need the same data when they are initialized.

If cache is set to true, data from the request will be stored and additional requests with the same parameters are pulled from the stored results.

The HttpBaseService class provides functions for accessing and deleting cache.

# Service Usage
```typescript
@Injectable()
export class HttpService extends HttpBaseService {
	constructor(private http: Http) {
		super();
	}

	@HttpRequest({
		cache: true
	})
	public getStuff(id: number): Observable<any> {
		return this.http.get('/data.json')
		    .map(res => res.json()
		    .filter(item => item.id === id));
	}
}
```

# Component Usage
```typescript
@Component({
	selector: 'test-component',
	template: `Hello World`
})
export class DemoAppComponent implements OnInit {
	constructor(private service: HttpService) {}

	ngOnInit() {
		this.service.getStuff(13).subscribe((res)=>{
			console.log(res);
		});
        
        // clear cache if we need to
		let cacheKey = this.service.getCacheKey('getStuff', 13);
		this.service.clearCache(cacheKey);
	}
}
```