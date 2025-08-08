"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

  // src/backend/client/linkExtractors.js
  function getVideoId(url) {
    const patterns = [
      /v=([^&]+)/,
      /youtu\.be\/([^?&]+)/,
      /embed\/([^?&]+)/,
      /music\.youtube\.com\/watch\?v=([^&]+)/
      // YouTube Music: ?v=ABC123
    ];
    for (const re of patterns) {
      const match = url.match(re);
      if (match) {
        console.log(match[1]);
        return match[1];
      }
    }
    return null;
  }

  // src/backend/server/youtubeQueries.ts
  var API_KEY = "AIzaSyByzNFPU1XR0gm_kfd2EoThjYlVeezmup8";
  async function fetchYTInfo(videoId) {
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data.items?.length) {
      return null;
    }
    const snip = data.items[0].snippet;
    console.log(snip.channelId);
    return {
      title: snip.title,
      channel: snip.channelTitle,
      description: snip.description,
      tags: snip.tags,
      id: snip.channelId
    };
  }

  // src/backend/client/pageScraper.ts
  function scrapeYTInfo() {
    let title;
    let channelName;
    if (location.hostname === "music.youtube.com") {
      title = document.querySelector(".title.ytmusic-player-bar");
      channelName = document.querySelector(".byline.ytmusic-player-bar a");
    } else {
      title = document.querySelector("h1.title yt-formatted-string") || document.querySelector("ytd-watch-metadata h1");
      channelName = document.querySelector("#owner-name a") || document.querySelector("ytd-channel-name#channel-name a");
    }
    const ytDescription = document.querySelector("#description");
    const ytUsername = document.querySelector('a.yt-simple-endpoint.style-scope.yt-formatted-string[href^="/@"]');
    console.log("[YT-EXT] titleEl", title, "channelEl", channelName);
    if (title) {
      console.log("Title: ", title.textContent.trim());
    }
    if (channelName) {
      console.log("Channel: ", channelName.textContent.trim());
    }
    if (channelName && title && ytDescription) {
      console.log(ytUsername?.textContent?.trim());
      return {
        videoTitle: title.textContent.trim(),
        channel: channelName.textContent.trim(),
        description: ytDescription?.textContent.trim(),
        username: ytUsername?.textContent.trim()
      };
    }
    console.log("no info found");
    return null;
  }

  // src/backend/client/cache.js
  var cacheLifeTime = 3 * 60 * 1e3;
  function getCacheKey(identifier, type = "name") {
    return `${type}:${identifier.toLowerCase()}`;
  }
  async function cacheArtist(identifier, data, type = "name") {
    const key = getCacheKey(identifier, type);
    const cacheEntry = {
      data,
      timestamp: Date.now(),
      links: data.links || []
    };
    console.log(`cached artist: ${JSON.stringify(cacheEntry)}`);
    await chrome.storage.local.set({
      [`cache_${key}`]: cacheEntry
    });
  }
  async function getCachedArtist(identifier, type = "name") {
    const key = getCacheKey(identifier, type);
    const result = await chrome.storage.local.get(`cache_${key}`);
    const cached = result[`cache_${key}`];
    if (!cached) {
      return null;
    }
    if (Date.now() - cached.timestamp > cacheLifeTime) {
      await chrome.storage.local.remove(`cache_${key}`);
      return null;
    }
    return cached.data;
  }
  async function cacheVideoResult(videoId, artistData) {
    const key = `video_${videoId}`;
    await chrome.storage.local.set({
      [`cache_${key}`]: {
        data: artistData,
        timestamp: Date.now()
      }
    });
  }
  async function getCachedVideoResult(videoId) {
    const key = `video_${videoId}`;
    const result = await chrome.storage.local.get(`cache_${key}`);
    const cached = result[`cache_${key}`];
    if (!cached) return null;
    if (Date.now() - cached.timestamp > cacheLifeTime) {
      await chrome.storage.local.remove(`cache_${key}`);
      return null;
    }
    return cached.data;
  }
  function createMediaSessionKey(mediaSessionData) {
    const title = (mediaSessionData.title || "").toLowerCase().trim();
    const artist = (mediaSessionData.channel || "").toLowerCase().trim();
    return `${artist}_${title}`.replace(/[^a-z0-9_]/g, "");
  }
  async function getCachedMediaSessionResult(mediaSessionData) {
    const key = createMediaSessionKey(mediaSessionData);
    const result = await chrome.storage.local.get(`cache_media_${key}`);
    const cached = result[`cache_media_${key}`];
    console.log(`grabbing cache with key: cache is  ${cached}`);
    if (!cached) return null;
    if (Date.now() - cached.timestamp > cacheLifeTime) {
      await chrome.storage.local.remove(`cache_media_${key}`);
      return null;
    }
    return cached.data;
  }
  async function cacheMediaSessionResult(mediaSessionData, artistData) {
    const key = createMediaSessionKey(mediaSessionData);
    await chrome.storage.local.set({
      [`cache_media_${key}`]: {
        data: artistData,
        timestamp: Date.now(),
        originalMediaData: mediaSessionData
      }
    });
    console.log(`caching data: ${key}`);
  }

  // src/connections/api.js
  var API = "https://mn-chrome-ext.vercel.app";
  async function fetchArtist(info) {
    console.log("fetchArtist called with:", info);
    const cached = getCachedArtist(info.id, "id");
    if (cached) return cached;
    const url = `${API}/api/artist/by-id/${encodeURIComponent(info.id)}`;
    console.log("Fetching artist from:", url);
    const r = await fetch(url);
    const artist = r.ok ? await r.json() : null;
    console.log("Artist API response:", artist);
    if (artist && !artist.error && artist.id) {
      const linksUrl = `${API}/api/urlmap/links/${encodeURIComponent(artist.id)}`;
      const linksResponse = await fetch(linksUrl);
      artist.links = linksResponse.ok ? await linksResponse.json() : [];
      cacheArtist(info.id, artist, "id");
    }
    return artist;
  }
  async function fetchArtistFromName(info) {
    const cached = getCachedArtist(info.channel);
    if (cached) return cached;
    console.log("fetchArtistFromName called with:", info);
    const url = `${API}/api/artist/by-user/${encodeURIComponent(info.channel)}`;
    console.log("Fetching artist from:", url);
    const r = await fetch(url);
    const artist = r.ok ? await r.json() : null;
    console.log("Artist API response:", artist);
    if (artist && !artist.error && artist.id) {
      const linksUrl = `${API}/api/urlmap/links/${encodeURIComponent(artist.id)}`;
      const linksResponse = await fetch(linksUrl);
      artist.links = linksResponse.ok ? await linksResponse.json() : [];
      cacheArtist(info.channel, artist);
    }
    return artist;
  }
  async function extractMultipleArtistsFromTitle(titleOrData) {
    const url = `${API}/api/openai/extract-multiple-artists`;
    const requestBody = typeof titleOrData === "string" ? { title: titleOrData } : { data: titleOrData };
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.artists || [];
  }
  async function fetchMultipleArtistsByNames(artistNames) {
    if (!artistNames || artistNames.length === 0) return [];
    console.log("fetchMultipleArtistsByNames called with:", artistNames.map((name) => decodeURIComponent(name)));
    const url = `${API}/api/artist/batch`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usernames: artistNames.map((name) => encodeURIComponent(name)) })
    });
    if (!response.ok) {
      console.error("Batch artist fetch failed:", response.status, response.statusText);
      return [];
    }
    const data = await response.json();
    console.log("Batch artist API response:", data);
    return data.artists || [];
  }

  // src/backend/client/collabs.js
  function hasCollaborationKeywords(title) {
    const patterns = [
      /\bft\.?\s/i,
      // "ft. " or "ft "
      /\bfeat\.?\s/i,
      // "feat. " or "feat "  
      /\bfeaturing\b/i,
      // "featuring"
      /\bwith\b/i,
      // "with"
      /\sx\s/i,
      // " x " (Artist x Artist)
      /\s&\s/,
      // " & "
      /\s\+\s/,
      // " + "
      /\bvs\.?\b/i,
      // "vs" or "vs."
      /\b(collab|collaboration)\b/i,
      // "collab", "collaboration"
      /\bremix by\b/i,
      // "remix by"
      /\bprod\.? by\b/i
      // "prod by", "produced by"
    ];
    return patterns.some((pattern) => pattern.test(title));
  }

  // src/connections/preLoad.js
  async function preLoadMediaSession() {
    console.log("preloading...");
    try {
      const mediaData = detectMediaSession();
      if (!mediaData || !mediaData.title) {
        console.log("No media session data to preload");
        return;
      }
      const cached = await getCachedMediaSessionResult(mediaData);
      if (cached) {
        console.log("Preload: cached result already exists: " + cached);
        return;
      }
      let artists2 = [];
      if (mediaData.title) {
        const artist = await fetchArtistFromName(mediaData);
        if (artist && !artist.error && artist.id) {
          artists2.push({ ...artist, isPrimary: true });
          if (hasCollaborationKeywords(mediaData.title)) {
            const allArtistNames = await extractMultipleArtistsFromTitle(mediaData);
            const newNames = allArtistNames.filter(
              (name) => name.toLowerCase() !== artist.name.toLowerCase()
            );
            if (newNames.length > 0) {
              const newArtists = await fetchMultipleArtistsByNames(newNames);
              const validArtists = newArtists.filter((artist2) => artist2 && !artist2.error && artist2.id).map((artist2) => ({ ...artist2, isPrimary: false }));
              artists2.push(...validArtists);
            }
          }
          if (artists2.length > 0) {
            await cacheMediaSessionResult(mediaData, artists2);
            console.log("Successfully preloaded and cached artist data via name lookup");
            return artists2;
          }
        }
      }
      if (mediaData.title && artists2.length === 0) {
        console.log("Preload: falling back to AI extraction");
        const artistNames = await extractMultipleArtistsFromTitle(mediaData);
        console.log("AI extracted names:", artistNames);
        if (artistNames.length > 0) {
          const foundArtists = await fetchMultipleArtistsByNames(artistNames);
          const validArtists = foundArtists.filter((artist) => artist && !artist.error && artist.id).map((artist) => ({ ...artist, isPrimary: false }));
          artists2.push(...validArtists);
        }
        await cacheMediaSessionResult(mediaData, artists2);
      }
      return artists2;
    } catch (error) {
      console.error("Preload error:", error);
      return [];
    }
  }
  async function preLoadYT() {
    const videoId = getVideoId(window.location.href);
    if (!videoId) return;
    const cached = await getCachedVideoResult(videoId);
    if (cached) return;
    const info = await fetchYTInfo(videoId);
    if (!info) return;
    let artists2 = [];
    const artist = await fetchArtist({
      id: info.id,
      title: info.title,
      channel: info.channel
    });
    if (artist && !artist.error) {
      artists2.push({ ...artist, isPrimary: true });
      if (hasCollaborationKeywords(info.title)) {
        console.log("[preload] using AI for collaborators");
        const allArtistNames = await extractMultipleArtistsFromTitle(info);
        const newNames = allArtistNames.filter(
          (name) => name.toLowerCase() !== artist.name.toLowerCase()
        );
        if (newNames.length > 0) {
          const newArtists = await fetchMultipleArtistsByNames(newNames);
          const validArtists = newArtists.filter((artist2) => artist2 && !artist2.error && artist2.id).map((artist2) => ({ ...artist2, isPrimary: false }));
          artists2.push(...validArtists);
        }
      }
    }
    if (artists2.length === 0 && info.title) {
      console.log("[Preload] falling back to AI");
      const artistNames = await extractMultipleArtistsFromTitle(info);
      if (artistNames.length > 0) {
        const foundArtists = await fetchMultipleArtistsByNames(artistNames);
        const validArtists = foundArtists.filter((artist2) => artist2 && !artist2.error && artist2.id).map((artist2) => ({ ...artist2, isPrimary: false }));
        artists2.push(...validArtists);
      }
    }
    if (artists2.length > 0) {
      console.log("Successfully preloaded YouTube data");
    }
    await cacheVideoResult(videoId, artists2);
    return artists2;
  }
  async function preLoad() {
    try {
      const videoId = getVideoId(window.location.href);
      if (videoId) {
        console.log("preloading youtube");
        return await preLoadYT(videoId);
      }
      const mediaData = detectMediaSession();
      if (mediaData && mediaData.title) {
        console.log("preloading media session");
        return await preLoadMediaSession(mediaData);
      }
      console.log("No preloadable content found");
      return [];
    } catch (error) {
      console.error("Preload error:", error);
      return [];
    }
  }

  // node_modules/drizzle-orm/entity.js
  var entityKind = Symbol.for("drizzle:entityKind");
  var hasOwnEntityKind = Symbol.for("drizzle:hasOwnEntityKind");
  function is(value, type) {
    if (!value || typeof value !== "object") {
      return false;
    }
    if (value instanceof type) {
      return true;
    }
    if (!Object.prototype.hasOwnProperty.call(type, entityKind)) {
      throw new Error(
        `Class "${type.name ?? "<unknown>"}" doesn't look like a Drizzle entity. If this is incorrect and the class is provided by Drizzle, please report this as a bug.`
      );
    }
    let cls = value.constructor;
    if (cls) {
      while (cls) {
        if (entityKind in cls && cls[entityKind] === type[entityKind]) {
          return true;
        }
        cls = Object.getPrototypeOf(cls);
      }
    }
    return false;
  }

  // node_modules/drizzle-orm/column.js
  var _a;
  _a = entityKind;
  var Column = class {
    constructor(table, config) {
      __publicField(this, "name");
      __publicField(this, "primary");
      __publicField(this, "notNull");
      __publicField(this, "default");
      __publicField(this, "defaultFn");
      __publicField(this, "onUpdateFn");
      __publicField(this, "hasDefault");
      __publicField(this, "isUnique");
      __publicField(this, "uniqueName");
      __publicField(this, "uniqueType");
      __publicField(this, "dataType");
      __publicField(this, "columnType");
      __publicField(this, "enumValues");
      __publicField(this, "config");
      this.table = table;
      this.config = config;
      this.name = config.name;
      this.notNull = config.notNull;
      this.default = config.default;
      this.defaultFn = config.defaultFn;
      this.onUpdateFn = config.onUpdateFn;
      this.hasDefault = config.hasDefault;
      this.primary = config.primaryKey;
      this.isUnique = config.isUnique;
      this.uniqueName = config.uniqueName;
      this.uniqueType = config.uniqueType;
      this.dataType = config.dataType;
      this.columnType = config.columnType;
    }
    mapFromDriverValue(value) {
      return value;
    }
    mapToDriverValue(value) {
      return value;
    }
  };
  __publicField(Column, _a, "Column");

  // node_modules/drizzle-orm/column-builder.js
  var _a2;
  _a2 = entityKind;
  var ColumnBuilder = class {
    constructor(name, dataType, columnType) {
      __publicField(this, "config");
      /**
       * Alias for {@link $defaultFn}.
       */
      __publicField(this, "$default", this.$defaultFn);
      /**
       * Alias for {@link $onUpdateFn}.
       */
      __publicField(this, "$onUpdate", this.$onUpdateFn);
      this.config = {
        name,
        notNull: false,
        default: void 0,
        hasDefault: false,
        primaryKey: false,
        isUnique: false,
        uniqueName: void 0,
        uniqueType: void 0,
        dataType,
        columnType
      };
    }
    /**
     * Changes the data type of the column. Commonly used with `json` columns. Also, useful for branded types.
     *
     * @example
     * ```ts
     * const users = pgTable('users', {
     * 	id: integer('id').$type<UserId>().primaryKey(),
     * 	details: json('details').$type<UserDetails>().notNull(),
     * });
     * ```
     */
    $type() {
      return this;
    }
    /**
     * Adds a `not null` clause to the column definition.
     *
     * Affects the `select` model of the table - columns *without* `not null` will be nullable on select.
     */
    notNull() {
      this.config.notNull = true;
      return this;
    }
    /**
     * Adds a `default <value>` clause to the column definition.
     *
     * Affects the `insert` model of the table - columns *with* `default` are optional on insert.
     *
     * If you need to set a dynamic default value, use {@link $defaultFn} instead.
     */
    default(value) {
      this.config.default = value;
      this.config.hasDefault = true;
      return this;
    }
    /**
     * Adds a dynamic default value to the column.
     * The function will be called when the row is inserted, and the returned value will be used as the column value.
     *
     * **Note:** This value does not affect the `drizzle-kit` behavior, it is only used at runtime in `drizzle-orm`.
     */
    $defaultFn(fn) {
      this.config.defaultFn = fn;
      this.config.hasDefault = true;
      return this;
    }
    /**
     * Adds a dynamic update value to the column.
     * The function will be called when the row is updated, and the returned value will be used as the column value if none is provided.
     * If no `default` (or `$defaultFn`) value is provided, the function will be called when the row is inserted as well, and the returned value will be used as the column value.
     *
     * **Note:** This value does not affect the `drizzle-kit` behavior, it is only used at runtime in `drizzle-orm`.
     */
    $onUpdateFn(fn) {
      this.config.onUpdateFn = fn;
      this.config.hasDefault = true;
      return this;
    }
    /**
     * Adds a `primary key` clause to the column definition. This implicitly makes the column `not null`.
     *
     * In SQLite, `integer primary key` implicitly makes the column auto-incrementing.
     */
    primaryKey() {
      this.config.primaryKey = true;
      this.config.notNull = true;
      return this;
    }
  };
  __publicField(ColumnBuilder, _a2, "ColumnBuilder");

  // node_modules/drizzle-orm/table.js
  var TableName = Symbol.for("drizzle:Name");
  var Schema = Symbol.for("drizzle:Schema");
  var Columns = Symbol.for("drizzle:Columns");
  var OriginalName = Symbol.for("drizzle:OriginalName");
  var BaseName = Symbol.for("drizzle:BaseName");
  var IsAlias = Symbol.for("drizzle:IsAlias");
  var ExtraConfigBuilder = Symbol.for("drizzle:ExtraConfigBuilder");
  var IsDrizzleTable = Symbol.for("drizzle:IsDrizzleTable");
  var _a3, _b, _c, _d, _e, _f, _g, _h, _i;
  _i = entityKind, _h = TableName, _g = OriginalName, _f = Schema, _e = Columns, _d = BaseName, _c = IsAlias, _b = ExtraConfigBuilder, _a3 = IsDrizzleTable;
  var Table = class {
    constructor(name, schema, baseName) {
      /**
       * @internal
       * Can be changed if the table is aliased.
       */
      __publicField(this, _h);
      /**
       * @internal
       * Used to store the original name of the table, before any aliasing.
       */
      __publicField(this, _g);
      /** @internal */
      __publicField(this, _f);
      /** @internal */
      __publicField(this, _e);
      /**
       *  @internal
       * Used to store the table name before the transformation via the `tableCreator` functions.
       */
      __publicField(this, _d);
      /** @internal */
      __publicField(this, _c, false);
      /** @internal */
      __publicField(this, _b);
      __publicField(this, _a3, true);
      this[TableName] = this[OriginalName] = name;
      this[Schema] = schema;
      this[BaseName] = baseName;
    }
  };
  __publicField(Table, _i, "Table");
  /** @internal */
  __publicField(Table, "Symbol", {
    Name: TableName,
    Schema,
    OriginalName,
    Columns,
    BaseName,
    IsAlias,
    ExtraConfigBuilder
  });

  // node_modules/drizzle-orm/pg-core/table.js
  var InlineForeignKeys = Symbol.for("drizzle:PgInlineForeignKeys");
  var _a4, _b2, _c2, _d2;
  var PgTable = class extends (_d2 = Table, _c2 = entityKind, _b2 = InlineForeignKeys, _a4 = Table.Symbol.ExtraConfigBuilder, _d2) {
    constructor() {
      super(...arguments);
      /**@internal */
      __publicField(this, _b2, []);
      /** @internal */
      __publicField(this, _a4);
    }
  };
  __publicField(PgTable, _c2, "PgTable");
  /** @internal */
  __publicField(PgTable, "Symbol", Object.assign({}, Table.Symbol, {
    InlineForeignKeys
  }));
  function pgTableWithSchema(name, columns, extraConfig, schema, baseName = name) {
    const rawTable = new PgTable(name, schema, baseName);
    const builtColumns = Object.fromEntries(
      Object.entries(columns).map(([name2, colBuilderBase]) => {
        const colBuilder = colBuilderBase;
        const column = colBuilder.build(rawTable);
        rawTable[InlineForeignKeys].push(...colBuilder.buildForeignKeys(column, rawTable));
        return [name2, column];
      })
    );
    const table = Object.assign(rawTable, builtColumns);
    table[Table.Symbol.Columns] = builtColumns;
    if (extraConfig) {
      table[PgTable.Symbol.ExtraConfigBuilder] = extraConfig;
    }
    return table;
  }
  var pgTable = (name, columns, extraConfig) => {
    return pgTableWithSchema(name, columns, extraConfig, void 0);
  };

  // node_modules/drizzle-orm/pg-core/foreign-keys.js
  var _a5;
  _a5 = entityKind;
  var ForeignKeyBuilder = class {
    constructor(config, actions) {
      /** @internal */
      __publicField(this, "reference");
      /** @internal */
      __publicField(this, "_onUpdate", "no action");
      /** @internal */
      __publicField(this, "_onDelete", "no action");
      this.reference = () => {
        const { name, columns, foreignColumns } = config();
        return { name, columns, foreignTable: foreignColumns[0].table, foreignColumns };
      };
      if (actions) {
        this._onUpdate = actions.onUpdate;
        this._onDelete = actions.onDelete;
      }
    }
    onUpdate(action) {
      this._onUpdate = action === void 0 ? "no action" : action;
      return this;
    }
    onDelete(action) {
      this._onDelete = action === void 0 ? "no action" : action;
      return this;
    }
    /** @internal */
    build(table) {
      return new ForeignKey(table, this);
    }
  };
  __publicField(ForeignKeyBuilder, _a5, "PgForeignKeyBuilder");
  var _a6;
  _a6 = entityKind;
  var ForeignKey = class {
    constructor(table, builder) {
      __publicField(this, "reference");
      __publicField(this, "onUpdate");
      __publicField(this, "onDelete");
      this.table = table;
      this.reference = builder.reference;
      this.onUpdate = builder._onUpdate;
      this.onDelete = builder._onDelete;
    }
    getName() {
      const { name, columns, foreignColumns } = this.reference();
      const columnNames = columns.map((column) => column.name);
      const foreignColumnNames = foreignColumns.map((column) => column.name);
      const chunks = [
        this.table[PgTable.Symbol.Name],
        ...columnNames,
        foreignColumns[0].table[PgTable.Symbol.Name],
        ...foreignColumnNames
      ];
      return name ?? `${chunks.join("_")}_fk`;
    }
  };
  __publicField(ForeignKey, _a6, "PgForeignKey");
  function foreignKey(config) {
    function mappedConfig() {
      const { name, columns, foreignColumns } = config;
      return {
        name,
        columns,
        foreignColumns
      };
    }
    return new ForeignKeyBuilder(mappedConfig);
  }

  // node_modules/drizzle-orm/tracing-utils.js
  function iife(fn, ...args) {
    return fn(...args);
  }

  // node_modules/drizzle-orm/pg-core/unique-constraint.js
  function unique(name) {
    return new UniqueOnConstraintBuilder(name);
  }
  function uniqueKeyName(table, columns) {
    return `${table[PgTable.Symbol.Name]}_${columns.join("_")}_unique`;
  }
  var _a7;
  _a7 = entityKind;
  var UniqueConstraintBuilder = class {
    constructor(columns, name) {
      /** @internal */
      __publicField(this, "columns");
      /** @internal */
      __publicField(this, "nullsNotDistinctConfig", false);
      this.name = name;
      this.columns = columns;
    }
    nullsNotDistinct() {
      this.nullsNotDistinctConfig = true;
      return this;
    }
    /** @internal */
    build(table) {
      return new UniqueConstraint(table, this.columns, this.nullsNotDistinctConfig, this.name);
    }
  };
  __publicField(UniqueConstraintBuilder, _a7, "PgUniqueConstraintBuilder");
  var _a8;
  _a8 = entityKind;
  var UniqueOnConstraintBuilder = class {
    constructor(name) {
      /** @internal */
      __publicField(this, "name");
      this.name = name;
    }
    on(...columns) {
      return new UniqueConstraintBuilder(columns, this.name);
    }
  };
  __publicField(UniqueOnConstraintBuilder, _a8, "PgUniqueOnConstraintBuilder");
  var _a9;
  _a9 = entityKind;
  var UniqueConstraint = class {
    constructor(table, columns, nullsNotDistinct, name) {
      __publicField(this, "columns");
      __publicField(this, "name");
      __publicField(this, "nullsNotDistinct", false);
      this.table = table;
      this.columns = columns;
      this.name = name ?? uniqueKeyName(this.table, this.columns.map((column) => column.name));
      this.nullsNotDistinct = nullsNotDistinct;
    }
    getName() {
      return this.name;
    }
  };
  __publicField(UniqueConstraint, _a9, "PgUniqueConstraint");

  // node_modules/drizzle-orm/pg-core/utils/array.js
  function parsePgArrayValue(arrayString, startFrom, inQuotes) {
    for (let i = startFrom; i < arrayString.length; i++) {
      const char = arrayString[i];
      if (char === "\\") {
        i++;
        continue;
      }
      if (char === '"') {
        return [arrayString.slice(startFrom, i).replace(/\\/g, ""), i + 1];
      }
      if (inQuotes) {
        continue;
      }
      if (char === "," || char === "}") {
        return [arrayString.slice(startFrom, i).replace(/\\/g, ""), i];
      }
    }
    return [arrayString.slice(startFrom).replace(/\\/g, ""), arrayString.length];
  }
  function parsePgNestedArray(arrayString, startFrom = 0) {
    const result = [];
    let i = startFrom;
    let lastCharIsComma = false;
    while (i < arrayString.length) {
      const char = arrayString[i];
      if (char === ",") {
        if (lastCharIsComma || i === startFrom) {
          result.push("");
        }
        lastCharIsComma = true;
        i++;
        continue;
      }
      lastCharIsComma = false;
      if (char === "\\") {
        i += 2;
        continue;
      }
      if (char === '"') {
        const [value2, startFrom2] = parsePgArrayValue(arrayString, i + 1, true);
        result.push(value2);
        i = startFrom2;
        continue;
      }
      if (char === "}") {
        return [result, i + 1];
      }
      if (char === "{") {
        const [value2, startFrom2] = parsePgNestedArray(arrayString, i + 1);
        result.push(value2);
        i = startFrom2;
        continue;
      }
      const [value, newStartFrom] = parsePgArrayValue(arrayString, i, false);
      result.push(value);
      i = newStartFrom;
    }
    return [result, i];
  }
  function parsePgArray(arrayString) {
    const [result] = parsePgNestedArray(arrayString, 1);
    return result;
  }
  function makePgArray(array) {
    return `{${array.map((item) => {
      if (Array.isArray(item)) {
        return makePgArray(item);
      }
      if (typeof item === "string") {
        return `"${item.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
      }
      return `${item}`;
    }).join(",")}}`;
  }

  // node_modules/drizzle-orm/pg-core/columns/common.js
  var _a10, _b3;
  var PgColumnBuilder = class extends (_b3 = ColumnBuilder, _a10 = entityKind, _b3) {
    constructor() {
      super(...arguments);
      __publicField(this, "foreignKeyConfigs", []);
    }
    array(size) {
      return new PgArrayBuilder(this.config.name, this, size);
    }
    references(ref, actions = {}) {
      this.foreignKeyConfigs.push({ ref, actions });
      return this;
    }
    unique(name, config) {
      this.config.isUnique = true;
      this.config.uniqueName = name;
      this.config.uniqueType = config?.nulls;
      return this;
    }
    /** @internal */
    buildForeignKeys(column, table) {
      return this.foreignKeyConfigs.map(({ ref, actions }) => {
        return iife(
          (ref2, actions2) => {
            const builder = new ForeignKeyBuilder(() => {
              const foreignColumn = ref2();
              return { columns: [column], foreignColumns: [foreignColumn] };
            });
            if (actions2.onUpdate) {
              builder.onUpdate(actions2.onUpdate);
            }
            if (actions2.onDelete) {
              builder.onDelete(actions2.onDelete);
            }
            return builder.build(table);
          },
          ref,
          actions
        );
      });
    }
  };
  __publicField(PgColumnBuilder, _a10, "PgColumnBuilder");
  var _a11, _b4;
  var PgColumn = class extends (_b4 = Column, _a11 = entityKind, _b4) {
    constructor(table, config) {
      if (!config.uniqueName) {
        config.uniqueName = uniqueKeyName(table, [config.name]);
      }
      super(table, config);
      this.table = table;
    }
  };
  __publicField(PgColumn, _a11, "PgColumn");
  var _a12, _b5;
  var PgArrayBuilder = class extends (_b5 = PgColumnBuilder, _a12 = entityKind, _b5) {
    constructor(name, baseBuilder, size) {
      super(name, "array", "PgArray");
      this.config.baseBuilder = baseBuilder;
      this.config.size = size;
    }
    /** @internal */
    build(table) {
      const baseColumn = this.config.baseBuilder.build(table);
      return new PgArray(
        table,
        this.config,
        baseColumn
      );
    }
  };
  __publicField(PgArrayBuilder, _a12, "PgArrayBuilder");
  var _a13, _b6;
  var _PgArray = class _PgArray extends (_b6 = PgColumn, _a13 = entityKind, _b6) {
    constructor(table, config, baseColumn, range) {
      super(table, config);
      __publicField(this, "size");
      this.baseColumn = baseColumn;
      this.range = range;
      this.size = config.size;
    }
    getSQLType() {
      return `${this.baseColumn.getSQLType()}[${typeof this.size === "number" ? this.size : ""}]`;
    }
    mapFromDriverValue(value) {
      if (typeof value === "string") {
        value = parsePgArray(value);
      }
      return value.map((v) => this.baseColumn.mapFromDriverValue(v));
    }
    mapToDriverValue(value, isNestedArray = false) {
      const a = value.map(
        (v) => v === null ? null : is(this.baseColumn, _PgArray) ? this.baseColumn.mapToDriverValue(v, true) : this.baseColumn.mapToDriverValue(v)
      );
      if (isNestedArray)
        return a;
      return makePgArray(a);
    }
  };
  __publicField(_PgArray, _a13, "PgArray");
  var PgArray = _PgArray;

  // node_modules/drizzle-orm/pg-core/columns/enum.js
  var isPgEnumSym = Symbol.for("drizzle:isPgEnum");
  function isPgEnum(obj) {
    return !!obj && typeof obj === "function" && isPgEnumSym in obj && obj[isPgEnumSym] === true;
  }
  var _a14, _b7;
  var PgEnumColumnBuilder = class extends (_b7 = PgColumnBuilder, _a14 = entityKind, _b7) {
    constructor(name, enumInstance) {
      super(name, "string", "PgEnumColumn");
      this.config.enum = enumInstance;
    }
    /** @internal */
    build(table) {
      return new PgEnumColumn(
        table,
        this.config
      );
    }
  };
  __publicField(PgEnumColumnBuilder, _a14, "PgEnumColumnBuilder");
  var _a15, _b8;
  var PgEnumColumn = class extends (_b8 = PgColumn, _a15 = entityKind, _b8) {
    constructor(table, config) {
      super(table, config);
      __publicField(this, "enum", this.config.enum);
      __publicField(this, "enumValues", this.config.enum.enumValues);
      this.enum = config.enum;
    }
    getSQLType() {
      return this.enum.enumName;
    }
  };
  __publicField(PgEnumColumn, _a15, "PgEnumColumn");
  function pgEnum(enumName, values) {
    return pgEnumWithSchema(enumName, values, void 0);
  }
  function pgEnumWithSchema(enumName, values, schema) {
    const enumInstance = Object.assign(
      (name) => new PgEnumColumnBuilder(name, enumInstance),
      {
        enumName,
        enumValues: values,
        schema,
        [isPgEnumSym]: true
      }
    );
    return enumInstance;
  }

  // node_modules/drizzle-orm/subquery.js
  var _a16;
  _a16 = entityKind;
  var Subquery = class {
    constructor(sql2, selection, alias, isWith = false) {
      this._ = {
        brand: "Subquery",
        sql: sql2,
        selectedFields: selection,
        alias,
        isWith
      };
    }
    // getSQL(): SQL<unknown> {
    // 	return new SQL([this]);
    // }
  };
  __publicField(Subquery, _a16, "Subquery");
  var _a17, _b9;
  var WithSubquery = class extends (_b9 = Subquery, _a17 = entityKind, _b9) {
  };
  __publicField(WithSubquery, _a17, "WithSubquery");

  // node_modules/drizzle-orm/version.js
  var version = "0.30.10";

  // node_modules/drizzle-orm/tracing.js
  var otel;
  var rawTracer;
  var tracer = {
    startActiveSpan(name, fn) {
      if (!otel) {
        return fn();
      }
      if (!rawTracer) {
        rawTracer = otel.trace.getTracer("drizzle-orm", version);
      }
      return iife(
        (otel2, rawTracer2) => rawTracer2.startActiveSpan(
          name,
          (span) => {
            try {
              return fn(span);
            } catch (e) {
              span.setStatus({
                code: otel2.SpanStatusCode.ERROR,
                message: e instanceof Error ? e.message : "Unknown error"
                // eslint-disable-line no-instanceof/no-instanceof
              });
              throw e;
            } finally {
              span.end();
            }
          }
        ),
        otel,
        rawTracer
      );
    }
  };

  // node_modules/drizzle-orm/view-common.js
  var ViewBaseConfig = Symbol.for("drizzle:ViewBaseConfig");

  // node_modules/drizzle-orm/sql/sql.js
  var _a18;
  _a18 = entityKind;
  var FakePrimitiveParam = class {
  };
  __publicField(FakePrimitiveParam, _a18, "FakePrimitiveParam");
  function isSQLWrapper(value) {
    return value !== null && value !== void 0 && typeof value.getSQL === "function";
  }
  function mergeQueries(queries) {
    const result = { sql: "", params: [] };
    for (const query of queries) {
      result.sql += query.sql;
      result.params.push(...query.params);
      if (query.typings?.length) {
        if (!result.typings) {
          result.typings = [];
        }
        result.typings.push(...query.typings);
      }
    }
    return result;
  }
  var _a19;
  _a19 = entityKind;
  var StringChunk = class {
    constructor(value) {
      __publicField(this, "value");
      this.value = Array.isArray(value) ? value : [value];
    }
    getSQL() {
      return new SQL([this]);
    }
  };
  __publicField(StringChunk, _a19, "StringChunk");
  var _a20;
  _a20 = entityKind;
  var _SQL = class _SQL {
    constructor(queryChunks) {
      /** @internal */
      __publicField(this, "decoder", noopDecoder);
      __publicField(this, "shouldInlineParams", false);
      this.queryChunks = queryChunks;
    }
    append(query) {
      this.queryChunks.push(...query.queryChunks);
      return this;
    }
    toQuery(config) {
      return tracer.startActiveSpan("drizzle.buildSQL", (span) => {
        const query = this.buildQueryFromSourceParams(this.queryChunks, config);
        span?.setAttributes({
          "drizzle.query.text": query.sql,
          "drizzle.query.params": JSON.stringify(query.params)
        });
        return query;
      });
    }
    buildQueryFromSourceParams(chunks, _config) {
      const config = Object.assign({}, _config, {
        inlineParams: _config.inlineParams || this.shouldInlineParams,
        paramStartIndex: _config.paramStartIndex || { value: 0 }
      });
      const {
        escapeName,
        escapeParam,
        prepareTyping,
        inlineParams,
        paramStartIndex
      } = config;
      return mergeQueries(chunks.map((chunk) => {
        if (is(chunk, StringChunk)) {
          return { sql: chunk.value.join(""), params: [] };
        }
        if (is(chunk, Name)) {
          return { sql: escapeName(chunk.value), params: [] };
        }
        if (chunk === void 0) {
          return { sql: "", params: [] };
        }
        if (Array.isArray(chunk)) {
          const result = [new StringChunk("(")];
          for (const [i, p] of chunk.entries()) {
            result.push(p);
            if (i < chunk.length - 1) {
              result.push(new StringChunk(", "));
            }
          }
          result.push(new StringChunk(")"));
          return this.buildQueryFromSourceParams(result, config);
        }
        if (is(chunk, _SQL)) {
          return this.buildQueryFromSourceParams(chunk.queryChunks, {
            ...config,
            inlineParams: inlineParams || chunk.shouldInlineParams
          });
        }
        if (is(chunk, Table)) {
          const schemaName = chunk[Table.Symbol.Schema];
          const tableName = chunk[Table.Symbol.Name];
          return {
            sql: schemaName === void 0 ? escapeName(tableName) : escapeName(schemaName) + "." + escapeName(tableName),
            params: []
          };
        }
        if (is(chunk, Column)) {
          return { sql: escapeName(chunk.table[Table.Symbol.Name]) + "." + escapeName(chunk.name), params: [] };
        }
        if (is(chunk, View)) {
          const schemaName = chunk[ViewBaseConfig].schema;
          const viewName = chunk[ViewBaseConfig].name;
          return {
            sql: schemaName === void 0 ? escapeName(viewName) : escapeName(schemaName) + "." + escapeName(viewName),
            params: []
          };
        }
        if (is(chunk, Param)) {
          const mappedValue = chunk.value === null ? null : chunk.encoder.mapToDriverValue(chunk.value);
          if (is(mappedValue, _SQL)) {
            return this.buildQueryFromSourceParams([mappedValue], config);
          }
          if (inlineParams) {
            return { sql: this.mapInlineParam(mappedValue, config), params: [] };
          }
          let typings;
          if (prepareTyping !== void 0) {
            typings = [prepareTyping(chunk.encoder)];
          }
          return { sql: escapeParam(paramStartIndex.value++, mappedValue), params: [mappedValue], typings };
        }
        if (is(chunk, Placeholder)) {
          return { sql: escapeParam(paramStartIndex.value++, chunk), params: [chunk] };
        }
        if (is(chunk, _SQL.Aliased) && chunk.fieldAlias !== void 0) {
          return { sql: escapeName(chunk.fieldAlias), params: [] };
        }
        if (is(chunk, Subquery)) {
          if (chunk._.isWith) {
            return { sql: escapeName(chunk._.alias), params: [] };
          }
          return this.buildQueryFromSourceParams([
            new StringChunk("("),
            chunk._.sql,
            new StringChunk(") "),
            new Name(chunk._.alias)
          ], config);
        }
        if (isPgEnum(chunk)) {
          if (chunk.schema) {
            return { sql: escapeName(chunk.schema) + "." + escapeName(chunk.enumName), params: [] };
          }
          return { sql: escapeName(chunk.enumName), params: [] };
        }
        if (isSQLWrapper(chunk)) {
          return this.buildQueryFromSourceParams([
            new StringChunk("("),
            chunk.getSQL(),
            new StringChunk(")")
          ], config);
        }
        if (inlineParams) {
          return { sql: this.mapInlineParam(chunk, config), params: [] };
        }
        return { sql: escapeParam(paramStartIndex.value++, chunk), params: [chunk] };
      }));
    }
    mapInlineParam(chunk, { escapeString }) {
      if (chunk === null) {
        return "null";
      }
      if (typeof chunk === "number" || typeof chunk === "boolean") {
        return chunk.toString();
      }
      if (typeof chunk === "string") {
        return escapeString(chunk);
      }
      if (typeof chunk === "object") {
        const mappedValueAsString = chunk.toString();
        if (mappedValueAsString === "[object Object]") {
          return escapeString(JSON.stringify(chunk));
        }
        return escapeString(mappedValueAsString);
      }
      throw new Error("Unexpected param value: " + chunk);
    }
    getSQL() {
      return this;
    }
    as(alias) {
      if (alias === void 0) {
        return this;
      }
      return new _SQL.Aliased(this, alias);
    }
    mapWith(decoder) {
      this.decoder = typeof decoder === "function" ? { mapFromDriverValue: decoder } : decoder;
      return this;
    }
    inlineParams() {
      this.shouldInlineParams = true;
      return this;
    }
    /**
     * This method is used to conditionally include a part of the query.
     *
     * @param condition - Condition to check
     * @returns itself if the condition is `true`, otherwise `undefined`
     */
    if(condition) {
      return condition ? this : void 0;
    }
  };
  __publicField(_SQL, _a20, "SQL");
  var SQL = _SQL;
  var _a21;
  _a21 = entityKind;
  var Name = class {
    constructor(value) {
      __publicField(this, "brand");
      this.value = value;
    }
    getSQL() {
      return new SQL([this]);
    }
  };
  __publicField(Name, _a21, "Name");
  var noopDecoder = {
    mapFromDriverValue: (value) => value
  };
  var noopEncoder = {
    mapToDriverValue: (value) => value
  };
  var noopMapper = {
    ...noopDecoder,
    ...noopEncoder
  };
  var _a22;
  _a22 = entityKind;
  var Param = class {
    /**
     * @param value - Parameter value
     * @param encoder - Encoder to convert the value to a driver parameter
     */
    constructor(value, encoder = noopEncoder) {
      __publicField(this, "brand");
      this.value = value;
      this.encoder = encoder;
    }
    getSQL() {
      return new SQL([this]);
    }
  };
  __publicField(Param, _a22, "Param");
  function sql(strings, ...params) {
    const queryChunks = [];
    if (params.length > 0 || strings.length > 0 && strings[0] !== "") {
      queryChunks.push(new StringChunk(strings[0]));
    }
    for (const [paramIndex, param2] of params.entries()) {
      queryChunks.push(param2, new StringChunk(strings[paramIndex + 1]));
    }
    return new SQL(queryChunks);
  }
  ((sql2) => {
    function empty() {
      return new SQL([]);
    }
    sql2.empty = empty;
    function fromList(list) {
      return new SQL(list);
    }
    sql2.fromList = fromList;
    function raw(str) {
      return new SQL([new StringChunk(str)]);
    }
    sql2.raw = raw;
    function join(chunks, separator) {
      const result = [];
      for (const [i, chunk] of chunks.entries()) {
        if (i > 0 && separator !== void 0) {
          result.push(separator);
        }
        result.push(chunk);
      }
      return new SQL(result);
    }
    sql2.join = join;
    function identifier(value) {
      return new Name(value);
    }
    sql2.identifier = identifier;
    function placeholder2(name2) {
      return new Placeholder(name2);
    }
    sql2.placeholder = placeholder2;
    function param2(value, encoder) {
      return new Param(value, encoder);
    }
    sql2.param = param2;
  })(sql || (sql = {}));
  ((SQL2) => {
    var _a38;
    _a38 = entityKind;
    const _Aliased = class _Aliased {
      constructor(sql2, fieldAlias) {
        /** @internal */
        __publicField(this, "isSelectionField", false);
        this.sql = sql2;
        this.fieldAlias = fieldAlias;
      }
      getSQL() {
        return this.sql;
      }
      /** @internal */
      clone() {
        return new _Aliased(this.sql, this.fieldAlias);
      }
    };
    __publicField(_Aliased, _a38, "SQL.Aliased");
    let Aliased = _Aliased;
    SQL2.Aliased = Aliased;
  })(SQL || (SQL = {}));
  var _a23;
  _a23 = entityKind;
  var Placeholder = class {
    constructor(name2) {
      this.name = name2;
    }
    getSQL() {
      return new SQL([this]);
    }
  };
  __publicField(Placeholder, _a23, "Placeholder");
  var _a24, _b10;
  _b10 = entityKind, _a24 = ViewBaseConfig;
  var View = class {
    constructor({ name: name2, schema, selectedFields, query }) {
      /** @internal */
      __publicField(this, _a24);
      this[ViewBaseConfig] = {
        name: name2,
        originalName: name2,
        schema,
        selectedFields,
        query,
        isExisting: !query,
        isAlias: false
      };
    }
    getSQL() {
      return new SQL([this]);
    }
  };
  __publicField(View, _b10, "View");
  Column.prototype.getSQL = function() {
    return new SQL([this]);
  };
  Table.prototype.getSQL = function() {
    return new SQL([this]);
  };
  Subquery.prototype.getSQL = function() {
    return new SQL([this]);
  };

  // node_modules/drizzle-orm/pg-core/columns/boolean.js
  var _a25, _b11;
  var PgBooleanBuilder = class extends (_b11 = PgColumnBuilder, _a25 = entityKind, _b11) {
    constructor(name) {
      super(name, "boolean", "PgBoolean");
    }
    /** @internal */
    build(table) {
      return new PgBoolean(table, this.config);
    }
  };
  __publicField(PgBooleanBuilder, _a25, "PgBooleanBuilder");
  var _a26, _b12;
  var PgBoolean = class extends (_b12 = PgColumn, _a26 = entityKind, _b12) {
    getSQLType() {
      return "boolean";
    }
  };
  __publicField(PgBoolean, _a26, "PgBoolean");
  function boolean(name) {
    return new PgBooleanBuilder(name);
  }

  // node_modules/drizzle-orm/pg-core/columns/date.common.js
  var _a27, _b13;
  var PgDateColumnBaseBuilder = class extends (_b13 = PgColumnBuilder, _a27 = entityKind, _b13) {
    defaultNow() {
      return this.default(sql`now()`);
    }
  };
  __publicField(PgDateColumnBaseBuilder, _a27, "PgDateColumnBaseBuilder");

  // node_modules/drizzle-orm/pg-core/columns/integer.js
  var _a28, _b14;
  var PgIntegerBuilder = class extends (_b14 = PgColumnBuilder, _a28 = entityKind, _b14) {
    constructor(name) {
      super(name, "number", "PgInteger");
    }
    /** @internal */
    build(table) {
      return new PgInteger(table, this.config);
    }
  };
  __publicField(PgIntegerBuilder, _a28, "PgIntegerBuilder");
  var _a29, _b15;
  var PgInteger = class extends (_b15 = PgColumn, _a29 = entityKind, _b15) {
    getSQLType() {
      return "integer";
    }
    mapFromDriverValue(value) {
      if (typeof value === "string") {
        return Number.parseInt(value);
      }
      return value;
    }
  };
  __publicField(PgInteger, _a29, "PgInteger");
  function integer(name) {
    return new PgIntegerBuilder(name);
  }

  // node_modules/drizzle-orm/pg-core/columns/text.js
  var _a30, _b16;
  var PgTextBuilder = class extends (_b16 = PgColumnBuilder, _a30 = entityKind, _b16) {
    constructor(name, config) {
      super(name, "string", "PgText");
      this.config.enumValues = config.enum;
    }
    /** @internal */
    build(table) {
      return new PgText(table, this.config);
    }
  };
  __publicField(PgTextBuilder, _a30, "PgTextBuilder");
  var _a31, _b17;
  var PgText = class extends (_b17 = PgColumn, _a31 = entityKind, _b17) {
    constructor() {
      super(...arguments);
      __publicField(this, "enumValues", this.config.enumValues);
    }
    getSQLType() {
      return "text";
    }
  };
  __publicField(PgText, _a31, "PgText");
  function text(name, config = {}) {
    return new PgTextBuilder(name, config);
  }

  // node_modules/drizzle-orm/pg-core/columns/timestamp.js
  var _a32, _b18;
  var PgTimestampBuilder = class extends (_b18 = PgDateColumnBaseBuilder, _a32 = entityKind, _b18) {
    constructor(name, withTimezone, precision) {
      super(name, "date", "PgTimestamp");
      this.config.withTimezone = withTimezone;
      this.config.precision = precision;
    }
    /** @internal */
    build(table) {
      return new PgTimestamp(table, this.config);
    }
  };
  __publicField(PgTimestampBuilder, _a32, "PgTimestampBuilder");
  var _a33, _b19;
  var PgTimestamp = class extends (_b19 = PgColumn, _a33 = entityKind, _b19) {
    constructor(table, config) {
      super(table, config);
      __publicField(this, "withTimezone");
      __publicField(this, "precision");
      __publicField(this, "mapFromDriverValue", (value) => {
        return new Date(this.withTimezone ? value : value + "+0000");
      });
      __publicField(this, "mapToDriverValue", (value) => {
        return value.toISOString();
      });
      this.withTimezone = config.withTimezone;
      this.precision = config.precision;
    }
    getSQLType() {
      const precision = this.precision === void 0 ? "" : ` (${this.precision})`;
      return `timestamp${precision}${this.withTimezone ? " with time zone" : ""}`;
    }
  };
  __publicField(PgTimestamp, _a33, "PgTimestamp");
  var _a34, _b20;
  var PgTimestampStringBuilder = class extends (_b20 = PgDateColumnBaseBuilder, _a34 = entityKind, _b20) {
    constructor(name, withTimezone, precision) {
      super(name, "string", "PgTimestampString");
      this.config.withTimezone = withTimezone;
      this.config.precision = precision;
    }
    /** @internal */
    build(table) {
      return new PgTimestampString(
        table,
        this.config
      );
    }
  };
  __publicField(PgTimestampStringBuilder, _a34, "PgTimestampStringBuilder");
  var _a35, _b21;
  var PgTimestampString = class extends (_b21 = PgColumn, _a35 = entityKind, _b21) {
    constructor(table, config) {
      super(table, config);
      __publicField(this, "withTimezone");
      __publicField(this, "precision");
      this.withTimezone = config.withTimezone;
      this.precision = config.precision;
    }
    getSQLType() {
      const precision = this.precision === void 0 ? "" : `(${this.precision})`;
      return `timestamp${precision}${this.withTimezone ? " with time zone" : ""}`;
    }
  };
  __publicField(PgTimestampString, _a35, "PgTimestampString");
  function timestamp(name, config = {}) {
    if (config.mode === "string") {
      return new PgTimestampStringBuilder(name, config.withTimezone ?? false, config.precision);
    }
    return new PgTimestampBuilder(name, config.withTimezone ?? false, config.precision);
  }

  // node_modules/drizzle-orm/pg-core/columns/uuid.js
  var _a36, _b22;
  var PgUUIDBuilder = class extends (_b22 = PgColumnBuilder, _a36 = entityKind, _b22) {
    constructor(name) {
      super(name, "string", "PgUUID");
    }
    /**
     * Adds `default gen_random_uuid()` to the column definition.
     */
    defaultRandom() {
      return this.default(sql`gen_random_uuid()`);
    }
    /** @internal */
    build(table) {
      return new PgUUID(table, this.config);
    }
  };
  __publicField(PgUUIDBuilder, _a36, "PgUUIDBuilder");
  var _a37, _b23;
  var PgUUID = class extends (_b23 = PgColumn, _a37 = entityKind, _b23) {
    getSQLType() {
      return "uuid";
    }
  };
  __publicField(PgUUID, _a37, "PgUUID");
  function uuid(name) {
    return new PgUUIDBuilder(name);
  }

  // src/backend/server/db/schema.ts
  var platformType = pgEnum("platform_type", ["social", "web3", "listen"]);
  var users = pgTable("users", {
    id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull()
  });
  var artists = pgTable(
    "artists",
    {
      id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
      legacyId: text("legacy_id"),
      bandcamp: text("bandcamp"),
      facebook: text("facebook"),
      x: text("x"),
      soundcloud: text("soundcloud"),
      notes: text("notes"),
      patreon: text("patreon"),
      name: text("name"),
      instagram: text("instagram"),
      youtube: text("youtube"),
      youtubechannel: text("youtubechannel"),
      bio: text("bio"),
      lcname: text("lcname"),
      soundcloudId: integer("soundcloudID"),
      spotify: text("spotify"),
      twitch: text("twitch"),
      imdb: text("imdb"),
      musicbrainz: text("musicbrainz"),
      wikidata: text("wikidata"),
      mixcloud: text("mixcloud"),
      facebookId: text("facebookID"),
      discogs: text("discogs"),
      tiktok: text("tiktok"),
      tiktokId: text("tiktokID"),
      jaxsta: text("jaxsta"),
      famousbirthdays: text("famousbirthdays"),
      songexploder: text("songexploder"),
      colorsxstudios: text("colorsxstudios"),
      bandsintown: text("bandsintown"),
      linktree: text("linktree"),
      onlyfans: text("onlyfans"),
      wikipedia: text("wikipedia"),
      audius: text("audius"),
      zora: text("zora"),
      catalog: text("catalog"),
      opensea: text("opensea"),
      foundation: text("foundation"),
      lastfm: text("lastfm"),
      linkedin: text("linkedin"),
      soundxyz: text("soundxyz"),
      mirror: text("mirror"),
      glassnode: text("glassnode"),
      collectsNfTs: boolean("collectsNFTs"),
      spotifyusername: text("spotifyusername"),
      bandcampfan: text("bandcampfan"),
      tellie: text("tellie"),
      wallets: text("wallets").array(),
      ens: text("ens"),
      lens: text("lens"),
      addedBy: uuid("added_by").notNull().default(sql`uuid_generate_v4()`),
      cameo: text("cameo"),
      farcaster: text("farcaster"),
      supercollector: text("supercollector"),
      createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow(),
      updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).default(sql`(now() AT TIME ZONE 'utc'::text)`).notNull()
    },
    (table) => {
      return {
        artistsAddedbyFkey: foreignKey({
          columns: [table.addedBy],
          foreignColumns: [users.id],
          name: "artists_addedby_fkey"
        })
      };
    }
  );
  var aiPrompts = pgTable(
    "aiprompts",
    {
      id: uuid("prompt_id").primaryKey().defaultRandom(),
      promptName: text("prompt_name").default("unnamed_prompt"),
      promptBeforeName: text("prompt_before_name").notNull(),
      promptAfterName: text("prompt_after_name").notNull(),
      isDefault: boolean("is_default").default(false),
      isEnabled: boolean("is_enabled").default(false),
      createdAt: timestamp("created_at").defaultNow()
    }
  );
  var urlmap = pgTable(
    "urlmap",
    {
      id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
      siteUrl: text("site_url").notNull(),
      siteName: text("site_name").notNull(),
      example: text("example").notNull(),
      appStringFormat: text("app_string_format").notNull(),
      order: integer("order"),
      isIframeEnabled: boolean("is_iframe_enabled").default(false).notNull(),
      isEmbedEnabled: boolean("is_embed_enabled").default(false).notNull(),
      cardDescription: text("card_description"),
      cardPlatformName: text("card_platform_name"),
      isWeb3Site: boolean("is_web3_site").notNull(),
      createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).default(sql`(now() AT TIME ZONE 'utc'::text)`).notNull(),
      updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).default(sql`(now() AT TIME ZONE 'utc'::text)`),
      siteImage: text("site_image"),
      regex: text("regex").default('""').notNull(),
      regexMatcher: text("regex_matcher"),
      isMonetized: boolean("is_monetized").default(false).notNull(),
      regexOptions: text("regex_options").array(),
      platformTypeList: platformType("platform_type_list").array().default(["social"]),
      colorHex: text("color_hex").notNull()
    },
    (table) => {
      return {
        urlmapSiteurlKey: unique("urlmap_siteurl_key").on(table.siteUrl),
        urlmapSitenameKey: unique("urlmap_sitename_key").on(table.siteName),
        urlmapExampleKey: unique("urlmap_example_key").on(table.example),
        urlmapAppstingformatKey: unique("urlmap_appstingformat_key").on(table.appStringFormat)
      };
    }
  );

  // src/backend/client/mediaSession.js
  function isExtensionValid() {
    try {
      chrome.runtime.id;
      return true;
    } catch {
      return false;
    }
  }
  function detectMediaSession() {
    if (!("mediaSession" in navigator)) {
      console.log("Media Session API not supported");
      return null;
    }
    const data = navigator.mediaSession.metadata;
    const playbackState = navigator.mediaSession.playbackState;
    if (playbackState === "paused") {
      return null;
    }
    if (!data) {
      console.log("No useful media session data (no title or artist)");
      return null;
    }
    return {
      title: data.title || "",
      channel: data.artist || "",
      // Fixed: was 'channel'
      album: data.album || "",
      source: "mediaSession",
      playbackState,
      url: window.location.href,
      domain: window.location.hostname
    };
  }
  function watchForMediaSession() {
    if (!("mediaSession" in navigator)) return;
    let lastMetaData = null;
    const checkMediaSession = () => {
      if (isExtensionValid) {
        const data = navigator.mediaSession.metadata;
        const state = navigator.mediaSession.playbackState;
        if (JSON.stringify(data) != JSON.stringify(lastMetaData) && state == "playing") {
          lastMetaData = JSON.stringify(data);
          chrome.runtime.sendMessage({
            action: "musicDetected",
            data: detectMediaSession()
          });
          preLoad();
        } else {
          lastMetaData = JSON.stringify(data);
          chrome.runtime.sendMessage({
            action: "musicPaused",
            data: detectMediaSession()
          });
        }
      }
    };
    setInterval(checkMediaSession, 3e3);
  }

  // src/connections/listener.ts
  console.log("[YT-EXT] content script injected");
  watchForMediaSession();
  chrome.runtime.onMessage.addListener((req, _sender, sendResponse) => {
    if (req.type === "GET_YT_INFO") {
      const videoId = getVideoId(location.href);
      if (!videoId) {
        sendResponse(null);
        return true;
      }
      fetchYTInfo(videoId).then((info) => sendResponse(info)).catch((err) => {
        console.error("[YT-EXT] Fetch error", err);
        sendResponse(null);
      });
    }
    if (req.type === "SCRAPE_YT_INFO") {
      sendResponse(scrapeYTInfo());
    }
    return true;
  });
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "checkMediaSession") {
      sendResponse(detectMediaSession());
    }
  });
})();
//# sourceMappingURL=content.js.map
