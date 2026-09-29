export class InteractiveRegistry {
  constructor() { this.objects = []; this.resolvers = new Map(); }
  register(object, resolver) { if (!this.resolvers.has(object)) this.objects.push(object); this.resolvers.set(object, resolver); }
  unregister(object) { this.resolvers.delete(object); const index = this.objects.indexOf(object); if (index >= 0) this.objects.splice(index, 1); }
  resolve(hit) { const resolver = this.resolvers.get(hit.object); return resolver ? resolver(hit) : null; }
  clear() { this.objects.length = 0; this.resolvers.clear(); }
}
