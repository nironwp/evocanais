import { PrismaClient } from '@prisma/client';
import TelegramAddon from './addons/telegram';

interface Config {
  staff_chat_id: string;
  owner_id: string;
  bot_token: string;
  min_users_in_group: number;
  start_command_text: string
  default_message: string;
  parse_mode: string;
  default_rotational_midia_path: string;
  horarios: string[]
  signal_message_text: string
  
}


interface Cache {
  groups: Group[];
  config: Config;
  prisma_client: PrismaClient
  bot: TelegramAddon;
}

interface Group {
    telegram_id: string
    name: string
    invite: string
}



export { Config, Cache, Group, };
