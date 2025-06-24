import { bootstrap } from "./main"
import { AppModule } from "./app.module";
import { NestFactory } from "@nestjs/core";

jest.mock('@nestjs/swagger', () => ({
    DocumentBuilder: jest.fn().mockImplementation(() => ({
        setTitle: jest.fn().mockReturnThis(),
        setDescription: jest.fn().mockReturnThis(),
        setVersion: jest.fn().mockReturnThis(),
        addTag: jest.fn().mockReturnThis(),
        addBearerAuth: jest.fn().mockReturnThis(),
        build: jest.fn().mockReturnValue({}),
    })),
    SwaggerModule: {
        createDocument: jest.fn().mockReturnValue({}),
        setup: jest.fn(),
    },
    ApiProperty: jest.fn(() => () => {}),
    ApiBearerAuth: jest.fn(() => () => {}),
    ApiTags: jest.fn(() => () => {}),
    ApiResponse: jest.fn(() => () => {}),
    ApiServiceUnavailableResponse: jest.fn(() => () => {}),
    ApiOkResponse: jest.fn(() => () => {}),
}));

jest.mock('@nestjs/core', () => ({
    NestFactory: {
        create: jest.fn().mockResolvedValue({
            enableCors: jest.fn(),
            useGlobalPipes: jest.fn(),
            useGlobalFilters: jest.fn(), 
            useGlobalInterceptors: jest.fn(),
            setGlobalPrefix: jest.fn(),
            listen: jest.fn(),
            getHttpAdapter: jest.fn(),
        })
    }
}))

describe('Main.ts Bootstrap', () => {
    let mockApp: {
        enableCors: jest.Mock;
        useGlobalPipes: jest.Mock;
        useGlobalFilters: jest.Mock;
        useGlobalInterceptors: jest.Mock;
        setGlobalPrefix: jest.Mock;
        listen: jest.Mock;
        getHttpAdapter: jest.Mock;
    };

    beforeEach(() => {
        mockApp = {
            enableCors: jest.fn(),
            useGlobalPipes: jest.fn(),
            useGlobalFilters: jest.fn(),
            useGlobalInterceptors: jest.fn(),
            setGlobalPrefix: jest.fn(),
            listen: jest.fn(),     
            getHttpAdapter: jest.fn(),
        };

        (NestFactory.create as jest.Mock).mockResolvedValue(mockApp)
    });

    it('should create application', async () => {
        await bootstrap();

        expect(NestFactory.create).toHaveBeenCalled();
        expect(NestFactory.create).toHaveBeenCalledWith(AppModule);
    });
    
    it('should set ports', async() => {
        await bootstrap();

        jest.spyOn(mockApp, 'listen').mockImplementation(() => Promise.resolve(3000))
        expect(mockApp.listen).toHaveBeenCalledWith(3000);
    })
    
    it('should set global pipes with correct options', async() => {
        await bootstrap();

        expect(mockApp.useGlobalPipes).toHaveBeenCalledWith(
            expect.objectContaining({
                isTransformEnabled: true,
                transformOptions: expect.objectContaining({
                    enableImplicitConversion: true,
                }),
                validatorOptions: expect.objectContaining({
                   whitelist: true,
                   forbidNonWhitelisted: true,
                })
            })
        );
    });

    it('should enable CORS', async() => {
        await bootstrap();

        expect(mockApp.enableCors).toHaveBeenCalled();
    });

    it('should set global filters', async() => {
        await bootstrap();

        expect(mockApp.useGlobalFilters).toHaveBeenCalled();
    });
})