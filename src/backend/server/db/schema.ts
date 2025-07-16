import { pgTable, foreignKey, uuid, timestamp, unique, text, integer, boolean, pgEnum, serial, varchar, jsonb, decimal } from "drizzle-orm/pg-core"
import { is, relations, sql } from "drizzle-orm"
export const platformType = pgEnum("platform_type", ['social', 'web3', 'listen'])

export const users = pgTable("users", {
  id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
});

export const artists = pgTable("artists", {
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
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`(now() AT TIME ZONE 'utc'::text)`).notNull(),
},
	(table) => {
		return {
			artistsAddedbyFkey: foreignKey({
				columns: [table.addedBy],
				foreignColumns: [users.id],
				name: "artists_addedby_fkey"
			}),
		}
	});

	export const aiPrompts = pgTable("aiprompts", {
		id: uuid("prompt_id").primaryKey().defaultRandom(),
		promptName: text("prompt_name").default("unnamed_prompt"),
		promptBeforeName: text("prompt_before_name").notNull(),
		promptAfterName: text("prompt_after_name").notNull(),
		isDefault: boolean("is_default").default(false),
		isEnabled: boolean("is_enabled").default(false),
		createdAt: timestamp("created_at").defaultNow(),
	  }
	);

	export const urlmap = pgTable("urlmap", {
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
		createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`(now() AT TIME ZONE 'utc'::text)`).notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`(now() AT TIME ZONE 'utc'::text)`),
		siteImage: text("site_image"),
		regex: text("regex").default('""').notNull(),
		regexMatcher: text("regex_matcher"),
		isMonetized: boolean("is_monetized").default(false).notNull(),
		regexOptions: text("regex_options").array(),
		platformTypeList: platformType("platform_type_list").array().default(["social"]),
		colorHex: text("color_hex").notNull(),
	},
		(table) => {
			return {
				urlmapSiteurlKey: unique("urlmap_siteurl_key").on(table.siteUrl),
				urlmapSitenameKey: unique("urlmap_sitename_key").on(table.siteName),
				urlmapExampleKey: unique("urlmap_example_key").on(table.example),
				urlmapAppstingformatKey: unique("urlmap_appstingformat_key").on(table.appStringFormat),
			}
		});