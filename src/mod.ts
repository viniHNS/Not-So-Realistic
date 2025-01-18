import { DependencyContainer } from "tsyringe";
import { IPostDBLoadMod } from "@spt/models/external/IPostDBLoadMod";
import { DatabaseServer } from "@spt/servers/DatabaseServer";
import { IPreSptLoadMod } from "@spt/models/external/IPreSptLoadMod";
import { ILogger } from "@spt/models/spt/utils/ILogger";
import { BaseClasses } from "@spt/models/enums/BaseClasses";
import { ItemHelper } from "@spt/helpers/ItemHelper";
import { LogTextColor } from "@spt/models/spt/logging/LogTextColor";
import { JsonUtil } from "@spt/utils/JsonUtil";
import { VFS } from "@spt/utils/VFS";
import { ImporterUtil } from "@spt/utils/ImporterUtil";
import path from "path";
import { IDHelper } from "./IDHelper";
import medsConfig from "../config/medsConfig.json";
import recoilConfig from "../config/recoilConfig.json";
import qolConfig from "../config/qolConfig.json";
import ammoConfig from "../config/ammoConfig.json";
import miscConfig from "../config/misc.json";
import paracetamol from "../db/buffs/paracetamol.json";
import exodrine from "../db/buffs/exodrine.json";
import { ITemplateItem } from "@spt/models/eft/common/tables/ITemplateItem";

class Mod implements IPostDBLoadMod, IPreSptLoadMod
{
    preSptLoad(container: DependencyContainer): void 
    {
        // get the logger from the server container
        const logger = container.resolve<ILogger>("WinstonLogger");
        logger.logWithColor("[ViniHNS] Not so realistic loading!", LogTextColor.GREEN);
    }

    public postDBLoad(container: DependencyContainer): void 
    {
        //#region Constants

        const logger2 = container.resolve<ILogger>("WinstonLogger");
        // get database from server
        const databaseServer = container.resolve<DatabaseServer>("DatabaseServer");

        const idHelper = new IDHelper;

        const itemHelper = container.resolve<ItemHelper>("ItemHelper");

        // Get all the in-memory json found in /assets/database
        const tables = databaseServer.getTables();

        const carKitHP: number = medsConfig.carKitHP;
        const salewaHP: number = medsConfig.salewaHP;
        const ifakHP: number = medsConfig.ifakHP;
        const afakHP: number = medsConfig.afakHP;
        const grizzlyHP: number = medsConfig.grizzlyHP;
        const ai2HP: number = medsConfig.ai2HP;
    
        const calocUsage: number = medsConfig.calocUsage;
        const armyBandageUsage: number = medsConfig.armyBandageUsage;
        const analginPainkillersUsage: number = medsConfig.analginPainkillersUsage;
        const augmentinUsage: number = medsConfig.augmentinUsage;
        const ibuprofenUsage: number = medsConfig.ibuprofenUsage;
        const vaselinUsage: number = medsConfig.vaselinUsage;
        const goldenStarUsage: number = medsConfig.goldenStarUsage;
        const aluminiumSplintUsage: number = medsConfig.aluminiumSplintUsage;
        const cmsUsage: number = medsConfig.cmsUsage;
        const survivalKitUsage: number = medsConfig.survivalKitUsage;

        // Find the meds item by its Id (thanks NoNeedName)
        const carKit: ITemplateItem = tables.templates.items[idHelper.CAR_FIRST_AID];
        const salewa: ITemplateItem = tables.templates.items[idHelper.SALEWA];
        const ifak: ITemplateItem = tables.templates.items[idHelper.IFAK];
        const afak: ITemplateItem = tables.templates.items[idHelper.AFAK];
        const grizzly: ITemplateItem = tables.templates.items[idHelper.GRIZZLY];
        const ai2: ITemplateItem = tables.templates.items[idHelper.AI2_MEDKIT];
        const calocB: ITemplateItem = tables.templates.items[idHelper.CALOC_B];
        const armyBandages: ITemplateItem = tables.templates.items[idHelper.ARMY_BANDAGE];

        const analginPainkillers: ITemplateItem = tables.templates.items[idHelper.ANALGIN];
        const augmentin: ITemplateItem = tables.templates.items[idHelper.AUGMENTIN];
        const ibuprofen: ITemplateItem = tables.templates.items[idHelper.IBUPROFEN];
        const vaselin: ITemplateItem = tables.templates.items[idHelper.VASELIN];
        const goldenStar: ITemplateItem = tables.templates.items[idHelper.GOLDEN_STAR];

        const aluminiumSplint: ITemplateItem = tables.templates.items[idHelper.ALUMINIUM_SPLINT];

        const survivalKit: ITemplateItem = tables.templates.items[idHelper.SURVIVAL_KIT];
        const cms: ITemplateItem = tables.templates.items[idHelper.CMS];

        const Nato762: string = "Caliber762x51";
        const Ru762_54: string = "Caliber762x54R";
        const Lapua338: string = "Caliber86x70";
        const Ru12_7: string = "Caliber127x55";
        const Ru762_39: string = "Caliber762x39";
        //#endregion

        //#region Functions
        // Meds Changes --------------------------------------------------------------------
        function setEffectDamage(item: any, effect: string, configKey: string, config: any): void {
            if (config[configKey]) {
                item._props.effects_damage[effect] = {
                    delay: 0,
                    duration: 0,
                    fadeOut: 0,
                    cost: config[configKey]
                };
            }
        }
    
        function removeEffect(item: any, effect: string): void {
            //Remove the effect from array like this one item._props.effects_damage["DestroyedPart"] 
            delete item._props.effects_damage[effect]

        }
    
        function setSurgeryEffect(item: any, configKey: string, config: any): void {
            if (config[configKey]) {
                item._props.effects_damage["DestroyedPart"] = {
                    delay: 0,
                    duration: 0,
                    fadeOut: 0,
                    healthPenaltyMin: 60,
                    healthPenaltyMax: 72,
                    cost: config[configKey]
                };
            }
        }
    
        function applyChanges(item: any, config: any, prefix: string): void {

            const effects = [
                { effect: "Fracture", canHeal: `${prefix}CanHealFractures`, costKey: `${prefix}FractureHealCost` },
                { effect: "DestroyedPart", canHeal: `${prefix}CanDoSurgery`, costKey: `${prefix}SurgeryCost`, isSurgery: true },
                { effect: "HeavyBleeding", canHeal: `${prefix}CanHealHeavyBleeding`, costKey: `${prefix}HeavyBleedingHealCost` },
                { effect: "LightBleeding", canHeal: `${prefix}CanHealLightBleeding`, costKey: `${prefix}LightBleedingHealCost` },
            ];

            effects.forEach(({ effect, canHeal, costKey, isSurgery }) => {
                if (config[canHeal]) {
                    if (isSurgery) {
                        setSurgeryEffect(item, costKey, config);
                    } else {
                        setEffectDamage(item, effect, costKey, config);
                    }
                } else {
                    removeEffect(item, effect);
                }
            });
            
        }

        function log(text: string, enable: boolean, color: LogTextColor): void {
            if (enable) {
                logger2.logWithColor(text, color);
            }
        }
        //#endregion

        //#region Meds Changes
        if(medsConfig.enable){
            if (medsConfig.grizzlyChanges) {
                applyChanges(grizzly, medsConfig, "Grizzly");
                grizzly._props.MaxHpResource = grizzlyHP;
                log("[Not So Realistic] Changing Grizzly", miscConfig.enableLogs, LogTextColor.GREEN);   
            } else {
                grizzly._props.effects_damage["LightBleeding"] = {
                    delay: 0,
                    duration: 0,
                    fadeOut: 0,
                    cost: 40
                },
                grizzly._props.effects_damage["HeavyBleeding"] = {
                    delay: 0,
                    duration: 0,
                    fadeOut: 0,
                    cost: 130
                },
                grizzly._props.effects_damage["Fracture"] = {
                    delay: 0,
                    duration: 0,
                    fadeOut: 0,
                    cost: 50
                },
                grizzly._props.effects_damage["Contusion"] = {
                    delay: 0,
                    duration: 0,
                    fadeOut: 0,
                    cost: 0
                },
                grizzly._props.effects_damage["RadExposure"] = {
                    delay: 0,
                    duration: 0,
                    fadeOut: 0,
                    cost: 0
                }
                grizzly._props.MaxHpResource = 1800;
                log("[Not So Realistic] Grizzly set to default", miscConfig.enableLogs, LogTextColor.GREEN);
            }
            
            if (medsConfig.ai2Changes) {
                applyChanges(ai2, medsConfig, "ai2");
                ai2._props.MaxHpResource = ai2HP;
                log("[Not So Realistic] Changing AI-2", miscConfig.enableLogs, LogTextColor.GREEN);
            } else {
                ai2._props.effects_damage["RadExposure"] = {
                    delay: 0,
                    duration: 0,
                    fadeOut: 0,
                    cost: 0
                }
                ai2._props.MaxHpResource = 100;
                log("[Not So Realistic] AI-2 set to default", miscConfig.enableLogs, LogTextColor.GREEN);
                
            }
            
            if (medsConfig.carKitChanges) {
                applyChanges(carKit, medsConfig, "carKit");
                carKit._props.MaxHpResource = carKitHP;
                log("[Not So Realistic] Changing Car First Aid Kit", miscConfig.enableLogs, LogTextColor.GREEN);
                
            } else {
                carKit._props.effects_damage["LightBleeding"] = {
                    delay: 0,
                    duration: 0,
                    fadeOut: 0,
                    cost: 50
                }
                carKit._props.MaxHpResource = 220;
                log("[Not So Realistic] Car First Aid Kit set to default", miscConfig.enableLogs, LogTextColor.GREEN);
            }
            
            if (medsConfig.salewaChanges) {
                applyChanges(salewa, medsConfig, "salewa");
                salewa._props.MaxHpResource = salewaHP;
                log("[Not So Realistic] Changing Salewa", miscConfig.enableLogs, LogTextColor.GREEN);
            } else {
                salewa._props.effects_damage["LightBleeding"] = {
                    delay: 0,
                    duration: 0,
                    fadeOut: 0,
                    cost: 45
                },
                salewa._props.effects_damage["HeavyBleeding"] = {
                    delay: 0,
                    duration: 0,
                    fadeOut: 0,
                    cost: 175
                },
                salewa._props.MaxHpResource = 400;
                log("[Not So Realistic] Salewa set to default", miscConfig.enableLogs, LogTextColor.GREEN);
            }
            
            if (medsConfig.ifakChanges) {
                applyChanges(ifak, medsConfig, "ifak");
                ifak._props.MaxHpResource = ifakHP;
                log("[Not So Realistic] Changing IFAK", miscConfig.enableLogs, LogTextColor.GREEN);  
            } else {
                ifak._props.effects_damage["LightBleeding"] = {
                    delay: 0,
                    duration: 0,
                    fadeOut: 0,
                    cost: 30
                },
                ifak._props.effects_damage["HeavyBleeding"] = {
                    delay: 0,
                    duration: 0,
                    fadeOut: 0,
                    cost: 210
                },
                ifak._props.effects_damage["RadExposure"] = {
                    delay: 0,
                    duration: 0,
                    fadeOut: 0,
                    cost: 0
                }
                ifak._props.MaxHpResource = 300;
                log("[Not So Realistic] IFAK set to default", miscConfig.enableLogs, LogTextColor.GREEN);  
            }
            
            if (medsConfig.afakChanges) {
                applyChanges(afak, medsConfig, "afak");
                afak._props.MaxHpResource = afakHP;
                log("[Not So Realistic] Changing AFAK", miscConfig.enableLogs, LogTextColor.GREEN);
            } else {
                afak._props.effects_damage["LightBleeding"] = {
                    delay: 0,
                    duration: 0,
                    fadeOut: 0,
                    cost: 30
                },
                afak._props.effects_damage["HeavyBleeding"] = {
                    delay: 0,
                    duration: 0,
                    fadeOut: 0,
                    cost: 170
                },
                afak._props.effects_damage["RadExposure"] = {
                    delay: 0,
                    duration: 0,
                    fadeOut: 0,
                    cost: 0
                }
                afak._props.MaxHpResource = 400;
                log("[Not So Realistic] AFAK set to default", miscConfig.enableLogs, LogTextColor.GREEN);
            }

            calocB._props.MaxHpResource = calocUsage;
            armyBandages._props.MaxHpResource = armyBandageUsage;
            analginPainkillers._props.MaxHpResource = analginPainkillersUsage;
            augmentin._props.MaxHpResource = augmentinUsage;
            ibuprofen._props.MaxHpResource = ibuprofenUsage;

            vaselin._props.MaxHpResource = vaselinUsage;
            goldenStar._props.MaxHpResource = goldenStarUsage;
            aluminiumSplint._props.MaxHpResource = aluminiumSplintUsage;
            cms._props.MaxHpResource = cmsUsage;
            survivalKit._props.MaxHpResource = survivalKitUsage;

            log("[Not So Realistic] Meds changes applied!", miscConfig.enableLogs, LogTextColor.GREEN);
        } else {
            log("[Not So Realistic] Meds changes disabled!", miscConfig.enableLogs, LogTextColor.GREEN);
        }
        
        log("========================================================================================", miscConfig.enableLogs, LogTextColor.GREEN);

        // -------------------------------------------------------------------------------------
        //#endregion

        //#region Individual Weapons Changes
        const kriss_9mm = tables.templates.items[idHelper.KRISS_VECTOR_9MM];
        kriss_9mm._props.bFirerate = 1100;

        const alpha_dog_supressor_9mm = tables.templates.items[idHelper.ALPHA_DOG_ALPHA_SUPRESSOR_9MM];
        const scopesToAdd = [
              "57ac965c24597706be5f975c",
              "57aca93d2459771f2c7e26db",
              "544a3f024bdc2d1d388b4568",
              "544a3a774bdc2d3a388b4567",
              "5d2dc3e548f035404a1a4798",
              "57adff4f24597737f373b6e6",
              "5c0517910db83400232ffee5",
              "591c4efa86f7741030027726",
              "570fd79bd2720bc7458b4583",
              "570fd6c2d2720bc6458b457f",
              "558022b54bdc2dac148b458d",
              "5c07dd120db834001c39092d",
              "5c0a2cec0db834001b7ce47d",
              "58491f3324597764bc48fa02",
              "584924ec24597768f12ae244",
              "5b30b0dc5acfc400153b7124",
              "6165ac8c290d254f5e6b2f6c",
              "60a23797a37c940de7062d02",
              "5d2da1e948f035477b1ce2ba",
              "5c0505e00db834001b735073",
              "609a63b6e2ff132951242d09",
              "584984812459776a704a82a6",
              "59f9d81586f7744c7506ee62",
              "570fd721d2720bc5458b4596",
              "57ae0171245977343c27bfcf",
              "5dfe6104585a0c3e995c7b82",
              "544a3d0a4bdc2d1b388b4567",
              "5d1b5e94d7ad1a2b865a96b0",
              "609bab8b455afd752b2e6138",
              "58d39d3d86f77445bb794ae7",
              "616554fe50224f204c1da2aa",
              "5c7d55f52e221644f31bff6a",
              "616584766ef05c2ce828ef57",
              "5b3b6dc75acfc47a8773fb1e",
              "615d8d878004cc50514c3233",
              "5b2389515acfc4771e1be0c0",
              "577d128124597739d65d0e56",
              "618b9643526131765025ab35",
              "618bab21526131765025ab3f",
              "5c86592b2e2216000e69e77c",
              "5a37ca54c4a282000d72296a",
              "5d0a29fed7ad1a002769ad08",
              "5c064c400db834001d23f468",
              "58d2664f86f7747fec5834f6",
              "57c69dd424597774c03b7bbc",
              "5b3b99265acfc4704b4a1afb",
              "5aa66a9be5b5b0214e506e89",
              "5aa66c72e5b5b00016327c93",
              "5c1cdd302e221602b3137250",
              "61714b2467085e45ef140b2c",
              "6171407e50224f204c1da3c5",
              "61713cc4d8e3106d9806c109",
              "5b31163c5acfc400153b71cb",
              "5a33b652c4a28232996e407c",
              "5a33b2c9c4a282000c5a9511",
              "59db7eed86f77461f8380365",
              "5a1ead28fcdbcb001912fa9f",
              "5dff77c759400025ea5150cf",
              "626bb8532c923541184624b4",
              "62811f461d5df4475f46a332",
              "63fc449f5bd61c6cf3784a88",
              "6477772ea8a38bb2050ed4db",
              "6478641c19d732620e045e17",
              "64785e7c19d732620e045e15",
              "65392f611406374f82152ba5",
              "653931da5db71d30ab1d6296",
              "655f13e0a246670fb0373245",
              "6567e751a715f85433025998"      
        ]
        alpha_dog_supressor_9mm._props.Slots[0]._props.filters[0].Filter.push(...scopesToAdd);

        const RPD_520mm = tables.templates.items[idHelper.RPD_520mm];
        const RPD_sawed_off_350mm = tables.templates.items[idHelper.RPD_SAWED_OFF_350mm];

        const muzzlesToAdd = [
            "59d64fc686f774171b243fe2",
            "5a0d716f1526d8000d26b1e2",
            "5f633f68f5750b524b45f112",
            "5c878ebb2e2216001219d48a",
            "59e61eb386f77440d64f5daf",
            "59e8a00d86f7742ad93b569c",
            "5a9ea27ca2750c00137fa672",
            "5cc9ad73d7f00c000e2579d4",
            "5c7951452e221644f31bfd5c",
            "615d8e9867085e45ef1409c6",
            "5a0abb6e1526d8000a025282",
            "59bffc1f86f77435b128b872",
            "593d489686f7745c6255d58a",
            "5a0d63621526d8dba31fe3bf",
            "5a9fbacda2750c00141e080f",
            "64942bfc6ee699f6890dff95"
        ]

        RPD_520mm._props.Slots[1]._props.filters[0].Filter.push(...muzzlesToAdd);
        RPD_sawed_off_350mm._props.Slots[0]._props.filters[0].Filter.push(...muzzlesToAdd);

        //#endregion

        //#region Ammo Changes
        const item = Object.values(tables.templates.items);
        const allAmmo = item.filter(x => itemHelper.isOfBaseclass(x._id, BaseClasses.AMMO));
        const allArmor = item.filter(x => itemHelper.isOfBaseclass(x._id, BaseClasses.ARMOR));

        const all762x51 = allAmmo.filter(x => x._props.Caliber == Nato762);
        const all762x54 = allAmmo.filter(x => x._props.Caliber == Ru762_54);
        const all338 = allAmmo.filter(x => x._props.Caliber == Lapua338);
        const all127x55 = allAmmo.filter(x => x._props.Caliber == Ru12_7);
        const all762x39 = allAmmo.filter(x => x._props.Caliber == Ru762_39);

        if(ammoConfig.enable){
            for(const armor of allArmor){
                armor._props.BluntThroughput *= ammoConfig.bluntDamageMultiplier;
            }

            for(const ammo762x51 of all762x51){
                ammo762x51._props.Damage *= Math.round(ammoConfig.damageMultiplier);
                ammo762x51._props.PenetrationPower *= Math.round(ammoConfig.penetrationPowerMultiplier);
                ammo762x51._props.ArmorDamage *= Math.round(ammoConfig.armorDamageMultiplier);
            }
            for(const ammo762x54 of all762x54){
                ammo762x54._props.Damage *= Math.round(ammoConfig.damageMultiplier);
                ammo762x54._props.PenetrationPower *= Math.round(ammoConfig.penetrationPowerMultiplier);
                ammo762x54._props.ArmorDamage *= Math.round(ammoConfig.armorDamageMultiplier);
            }
            for(const ammo338 of all338){
                ammo338._props.Damage *= Math.round(ammoConfig.damageMultiplier);
                ammo338._props.PenetrationPower *= Math.round(ammoConfig.penetrationPowerMultiplier);
                ammo338._props.ArmorDamage *= Math.round(ammoConfig.armorDamageMultiplier);
            }
            for(const ammo127x55 of all127x55){
                ammo127x55._props.Damage *= Math.round(ammoConfig.damageMultiplier);
                ammo127x55._props.PenetrationPower *= Math.round(ammoConfig.penetrationPowerMultiplier);
                ammo127x55._props.ArmorDamage *= Math.round(ammoConfig.armorDamageMultiplier);
            }
            for(const ammo762x39 of all762x39){
                ammo762x39._props.Damage *= Math.round(ammoConfig.damageMultiplier);
                ammo762x39._props.PenetrationPower *= Math.round(ammoConfig.penetrationPowerMultiplier);
                ammo762x39._props.ArmorDamage *= Math.round(ammoConfig.armorDamageMultiplier);
            }
            
            log("[Not So Realistic] Ammo changes applied!", miscConfig.enableLogs, LogTextColor.GREEN);
            
        } else { 
            log("[Not So Realistic] Ammo changes disabled!", miscConfig.enableLogs, LogTextColor.GREEN);
            
        }
        //#endregion

        //#region Recoil Changes
        // Changes in the Recoil of the weapons ------------------------------------------------
        if(recoilConfig.changes){
            tables.globals.config.Aiming.RecoilCrank = recoilConfig.recoilCrank;
            tables.globals.config.Aiming.RecoilDamping = recoilConfig.recoilDamping;
            tables.globals.config.Aiming.RecoilHandDamping = recoilConfig.recoilHandDamping;
            tables.globals.config.Aiming.RecoilVertBonus = 10;
            tables.globals.config.Aiming.RecoilBackBonus = 10;

            for (const weapons of Object.values(tables.templates.items)) {
                if(weapons._props.hasOwnProperty('weapClass')) {
                    const weapClass = weapons._props.weapClass;
                    const type = weapons._type;
                    if(weapClass == "" || weapClass == null || type == "Node"){
                        continue;
                    } else {

                        if(weapons._props.weapFireType.includes("doubleaction") && qolConfig.enable){
                            weapons._props.DoubleActionAccuracyPenalty = qolConfig.doubleActionAccuracyPenalty;
                            log(`[Not So Realistic] Changing the Double Action Accuracy Penalty from ${weapons._name} to ${qolConfig.doubleActionAccuracyPenalty}`, miscConfig.enableLogs, LogTextColor.GREEN);
                        }

                        const recoilConfigMap = {
                            smg: {
                                RecoilUp: recoilConfig.smgRecoilUp,
                                RecoilBack: recoilConfig.smgRecoilBack,
                                RecoilConvergence: recoilConfig.smgRecoilConvergence,
                                Dispersion: recoilConfig.smgDispersion,
                                RecoilHandDamping: recoilConfig.recoilHandDamping,
                                RecoilCamera: recoilConfig.smgRecoilCamera,
                                RecoilCategoryMultiplierHandRotation: recoilConfig.smgRecoilCategoryMultiplierHandRotation,
                                RecoilStableAngleIncreaseStep: recoilConfig.smgRecoilStableAngleIncreaseStep
                            },
                            assaultRifle: {
                                RecoilUp: recoilConfig.assaultRifleRecoilUp,
                                RecoilBack: recoilConfig.assaultRifleRecoilBack,
                                RecoilConvergence: recoilConfig.assaultRifleRecoilConvergence,
                                Dispersion: recoilConfig.assaultRifleDispersion,
                                RecoilHandDamping: recoilConfig.recoilHandDamping,
                                RecoilCamera: recoilConfig.assaultRifleRecoilCamera,
                                RecoilCategoryMultiplierHandRotation: recoilConfig.assaultRifleRecoilCategoryMultiplierHandRotation,
                                RecoilStableAngleIncreaseStep: recoilConfig.assaultRifleRecoilStableAngleIncreaseStep
                            },
                            assaultCarbine: {
                                RecoilUp: recoilConfig.assaultCarbineRecoilUp,
                                RecoilBack: recoilConfig.assaultCarbineRecoilBack,
                                RecoilConvergence: recoilConfig.assaultCarbineRecoilConvergence,
                                Dispersion: recoilConfig.assaultCarbineDispersion,
                                RecoilHandDamping: recoilConfig.recoilHandDamping,
                                RecoilCamera: recoilConfig.assaultCarbineRecoilCamera,
                                RecoilCategoryMultiplierHandRotation: recoilConfig.assaultCarbineRecoilCategoryMultiplierHandRotation,
                                RecoilStableAngleIncreaseStep: recoilConfig.assaultCarbineRecoilStableAngleIncreaseStep
                            },
                            sniperRifle: {
                                RecoilUp: recoilConfig.sniperRifleRecoilUp,
                                RecoilBack: recoilConfig.sniperRifleRecoilBack,
                                RecoilConvergence: recoilConfig.sniperRifleRecoilConvergence,
                                Dispersion: recoilConfig.sniperRifleDispersion,
                                RecoilHandDamping: recoilConfig.recoilHandDamping,
                                RecoilCamera: recoilConfig.sniperRifleRecoilCamera,
                                RecoilCategoryMultiplierHandRotation: recoilConfig.sniperRifleRecoilCategoryMultiplierHandRotation,
                                RecoilStableAngleIncreaseStep: recoilConfig.sniperRifleRecoilStableAngleIncreaseStep
                            },
                            marksmanRifle: {
                                RecoilUp: recoilConfig.marksmanRifleRecoilUp,
                                RecoilBack: recoilConfig.marksmanRifleRecoilBack,
                                RecoilConvergence: recoilConfig.marksmanRifleRecoilConvergence,
                                Dispersion: recoilConfig.marksmanRifleDispersion,
                                RecoilHandDamping: recoilConfig.recoilHandDamping,
                                RecoilCamera: recoilConfig.marksmanRifleRecoilCamera,
                                RecoilCategoryMultiplierHandRotation: recoilConfig.marksmanRifleRecoilCategoryMultiplierHandRotation,
                                RecoilStableAngleIncreaseStep: recoilConfig.marksmanRifleRecoilStableAngleIncreaseStep
                            },
                            pistol: {
                                RecoilUp: recoilConfig.pistolRecoilUp,
                                RecoilBack: recoilConfig.pistolRecoilBack,
                                RecoilConvergence: recoilConfig.pistolRecoilConvergence,
                                Dispersion: recoilConfig.pistolDispersion,
                                RecoilHandDamping: recoilConfig.recoilHandDamping,
                                RecoilCamera: recoilConfig.pistolRecoilCamera,
                                RecoilCategoryMultiplierHandRotation: recoilConfig.pistolRecoilCategoryMultiplierHandRotation,
                                RecoilStableAngleIncreaseStep: recoilConfig.pistolRecoilStableAngleIncreaseStep
                            },
                            machinegun: {
                                RecoilUp: recoilConfig.machinegunRecoilUp,
                                RecoilBack: recoilConfig.machinegunRecoilBack,
                                RecoilConvergence: recoilConfig.machinegunRecoilConvergence,
                                Dispersion: recoilConfig.machinegunDispersion,
                                RecoilHandDamping: recoilConfig.recoilHandDamping,
                                RecoilCamera: recoilConfig.machinegunRecoilCamera,
                                RecoilCategoryMultiplierHandRotation: recoilConfig.machinegunRecoilCategoryMultiplierHandRotation,
                                RecoilStableAngleIncreaseStep: recoilConfig.machinegunRecoilStableAngleIncreaseStep
                            },
                            shotgun: {
                                RecoilUp: recoilConfig.shotgunRecoilUp,
                                RecoilBack: recoilConfig.shotgunRecoilBack,
                                RecoilConvergence: recoilConfig.shotgunRecoilConvergence,
                                Dispersion: recoilConfig.shotgunDispersion,
                                RecoilHandDamping: recoilConfig.recoilHandDamping,
                                RecoilCamera: recoilConfig.shotgunRecoilCamera,
                                RecoilCategoryMultiplierHandRotation: recoilConfig.shotgunRecoilCategoryMultiplierHandRotation,
                                RecoilStableAngleIncreaseStep: recoilConfig.shotgunRecoilStableAngleIncreaseStep
                            }
                        };

                        if (recoilConfigMap[weapClass]) {
                            const config = recoilConfigMap[weapClass];
                            log(`[Not So Realistic] Changing the recoil of ${weapons._name}`, miscConfig.enableLogs, LogTextColor.GREEN);
                            weapons._props.RecoilForceUp *= (1 - config.RecoilUp);
                            weapons._props.RecoilForceBack *= (1 - config.RecoilBack);
                            weapons._props.RecoilReturnSpeedHandRotation *= (1 + config.RecoilConvergence);
                            weapons._props.RecolDispersion *= (1 - config.Dispersion);
                            weapons._props.RecoilDampingHandRotation *= (1 - config.RecoilHandDamping);
                            weapons._props.RecoilCamera *= (1 - config.RecoilCamera);
                            weapons._props.RecoilCategoryMultiplierHandRotation *= (1 - config.RecoilCategoryMultiplierHandRotation);
                            weapons._props.RecoilStableAngleIncreaseStep *= (1 - config.RecoilStableAngleIncreaseStep);
                        } else {
                            log(`[Not So Realistic] ${weapons._name} is a ${weapClass}. Ignoring...`, miscConfig.enableLogs, LogTextColor.YELLOW);
                        }
                    }
                }
            }
            log("[Not So Realistic] Weapon recoil changes applied!", miscConfig.enableLogs, LogTextColor.GREEN);
        } else {
            log("[Not So Realistic] All weapon recoil settings remain default. No changes applied.", miscConfig.enableLogs, LogTextColor.YELLOW);
        }
        log("========================================================================================", miscConfig.enableLogs, LogTextColor.GREEN);
        //#endregion
        
        //#region DB Stuff

        // Thanks TRON <3
        const logger = container.resolve<ILogger>("WinstonLogger");
        const db = container.resolve<DatabaseServer>("DatabaseServer").getTables();
        const ImporterUtil = container.resolve<ImporterUtil>("ImporterUtil");
        const JsonUtil = container.resolve<JsonUtil>("JsonUtil");
        const VFS = container.resolve<VFS>("VFS");
        const locales = db.locales.global;
        const items = db.templates.items;
        const handbook = db.templates.handbook.Items;
        const modPath = path.resolve(__dirname.toString()).split(path.sep).join("/")+"/";

        const mydb = ImporterUtil.loadRecursive(`${modPath}../db/`);

        const itemPath = `${modPath}../db/templates/items/`;
        const handbookPath = `${modPath}../db/templates/handbook/`;

        const buffs = db.globals.config.Health.Effects.Stimulator.Buffs

        //ID buff paracetamol -> 67150653e2809bdac7054f97
        //ID buff exodrine    -> 673780fffa6d1a8ee8c3c405

        buffs["67150653e2809bdac7054f97"] = paracetamol;
        buffs["673780fffa6d1a8ee8c3c405"] = exodrine;


        for(const itemFile in mydb.templates.items) {
            const item = JsonUtil.deserialize(VFS.readFile(`${itemPath}${itemFile}.json`));
            const hb = JsonUtil.deserialize(VFS.readFile(`${handbookPath}${itemFile}.json`));

            const itemId = item._id;
            //logger.info(itemId);

            items[itemId] = item;
            //logger.info(hb.ParentId);
            //logger.info(hb.Price);
            handbook.push({
                "Id": itemId,
                "ParentId": hb.ParentId,
                "Price": hb.Price
            });
        }
        for (const trader in mydb.traders.assort) {
            const traderAssort = db.traders[trader].assort
            
            for (const item of mydb.traders.assort[trader].items) {
                traderAssort.items.push(item);
            }
    
            for (const bc in mydb.traders.assort[trader].barter_scheme) {
                traderAssort.barter_scheme[bc] = mydb.traders.assort[trader].barter_scheme[bc];
            }
    
            for (const level in mydb.traders.assort[trader].loyal_level_items) {
                traderAssort.loyal_level_items[level] = mydb.traders.assort[trader].loyal_level_items[level];
            }
        }
        //logger.info("Test");
        // default localization
        for (const localeID in locales)
        {
            for (const id in mydb.locales.en.templates) {
                const item = mydb.locales.en.templates[id];
                //logger.info(item);
                for(const locale in item) {
                    //logger.info(locale);
                    //logger.info(item[locale]);
                    //logger.info(`${id} ${locale}`);
                    locales[localeID][`${id} ${locale}`] = item[locale];
                }
            }

            for (const id in mydb.locales.en.preset) {
                const item = mydb.locales.en.preset[id];
                for(const locale in item) {
                    //logger.info(`${id} ${locale}`);
                    locales[localeID][`${id}`] = item[locale];
                }
            }
        }

        for (const localeID in mydb.locales)
        {
            for (const id in mydb.locales[localeID].templates) {
                const item = mydb.locales[localeID].templates[id];
                //logger.info(item);
                for(const locale in item) {
                    locales[localeID][`${id}`] = item[locale];
                }
            }

            for (const id in mydb.locales[localeID].preset) {
                const item = mydb.locales[localeID].preset[id];
                for(const locale in item) {
                    //logger.info(`${id} ${locale}`);
                    locales[localeID][`${id} ${locale}`] = item[locale];
                }
                
            }

        }

        //#endregion

    }
}

module.exports = { mod: new Mod() }