var builder = DistributedApplication.CreateBuilder(args);

var api = builder.AddProject<Projects.Files_Api_TestHost>("files-api-testhost");

builder.AddViteApp("files-ui-testhost", "../Files.UI.TestHost")
    .WithReference(api)
    .WaitFor(api)
    .WithEnvironment("API_URL", api.GetEndpoint("https"));

builder.Build().Run();
