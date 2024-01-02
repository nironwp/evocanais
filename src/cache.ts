import {Cache, Config, Group} from './interfaces'
import * as YAML from 'yaml';
import * as fs from 'fs';
import TelegramAddon from './addons/telegram';
import { PrismaClient, Prisma } from '.prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';



class cache implements Cache {
	groups: Group[];
	config: Config;
	bot: TelegramAddon;

	constructor(
		groups: Group[],
		config: Config
	) {
		this.bot = {} as TelegramAddon
		this.groups = groups
		this.config = config
		this.prisma_client = new PrismaClient()
	}
	prisma_client: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>;

	addGroup(group: Group) {
		this.groups.push(group)
	}

	setBot(bot: TelegramAddon) {
		this.bot = bot
	}
}

const config = YAML.parse(fs.readFileSync('./config.yaml', 'utf8')) as Config

export default new cache([], config)